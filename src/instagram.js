#!/usr/bin/env node

const fs = require('fs')
const { chunk, map, get, flow, filter } = require('lodash/fp')
const axios = require('axios')
const { videoPaths, BASE_PATH } = require('./video-paths')
const { Cookie } = require('../env.js')
const { download } = require('./download')
const { ensurePathExists } = require('./ensure-path-exists')
const { handleError } = require('./error-handler')

main()

const downloadInsta = download()(videoPaths.instagram)

const COUNT = 10

async function getVideoUrlsFromApi(after, total = 0) {
  const query_hash = '8c86fed24fa03a8a2eea2a70a80c7b6b'
  const variables = encodeURI(
    JSON.stringify({
      id: '2910570632',
      first: 12,
      after,
    })
  )

  let hasNext
  let endCursor

  const urls = await axios
    .get(
      `https://www.instagram.com/graphql/query/?query_hash=${query_hash}&variables=${variables}`,
      { headers: { Cookie } }
    )
    .then(({ data }) => {
      hasNext = data.data.user.edge_saved_media.page_info.has_next_page
      endCursor = data.data.user.edge_saved_media.page_info.end_cursor
      return extractUrls(data)
    })
    .then(map(buildUrl))
    .catch(handleRequestError)

  const totalUrls = total + urls.length
  console.log(`Total urls: ${totalUrls}`)

  if (hasNext && totalUrls < COUNT) {
    const nextUrls = await getVideoUrlsFromApi(endCursor, totalUrls)
    return [...urls, ...nextUrls]
  } else {
    return urls
  }
}

function extractUrls(response) {
  return flow(
    get('data.user.edge_saved_media.edges'),
    map(get('node.shortcode'))
  )(response)
}

async function main() {
  if (!Cookie) {
    console.log('Error: Missing cookie in env')
    process.exit(1)
  }

  ensurePathExists(BASE_PATH)

  const urls = await getVideoUrlsFromApi()
  if (!urls) return
  console.log(urls)

  if (!fs.existsSync(videoPaths.instagram)) {
    fs.mkdirSync(videoPaths.instagram)
  }

  const chunks = chunk(4, urls)
  let statusCodes = []
  for (let i = 0; i < chunks.length; i++) {
    const urls = chunks[i]
    const codes = await Promise.all(urls.map(downloadInsta))
    statusCodes.push(...codes)
  }

  handleError(statusCodes)
}

function buildUrl(shortcode) {
  return `https://www.instagram.com/p/${shortcode}/`
}

function handleRequestError(error) {
  if (error.response) {
    console.log(error.response.data)
    console.log(error.response.status)
  } else if (error.request) {
    console.log(error.request)
  } else {
    console.log('Error', error.message)
  }
}

function readArchive() {
  const archivePath = videoPaths.instagram + '/archive.txt'
  return fs.readFileSync(archivePath)
}
