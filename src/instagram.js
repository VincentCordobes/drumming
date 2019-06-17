#!/usr/bin/env node

const fs = require('fs')
const { chunk, map, get, flow, filter } = require('lodash/fp')
const axios = require('axios')
const { videoPaths, BASE_PATH } = require('./video-paths')
const { Cookie } = require('../env.js')
const { download } = require('./download')
const { ensurePathExists } = require('./ensure-path-exists')

main()

const downloadInsta = download()(videoPaths.instagram)

function getVideoUrlsFromApi() {
  const FIRST_COUNT = 40

  const archive = readArchive()

  const query_hash = 'f883d95537fbcd400f466f63d42bd8a1'
  const variables = encodeURI(
    JSON.stringify({
      id: '2910570632',
      first: FIRST_COUNT,
    })
  )

  return axios
    .get(
      `https://www.instagram.com/graphql/query/?query_hash=${query_hash}&variables=${variables}`,
      { headers: { Cookie } }
    )
    .then(({ data }) => extractUrls(data))
    .then(filter(url => archive.indexOf(url) === -1))
    .then(map(buildUrl))
    .then(urls => {
      console.log(`${FIRST_COUNT - urls.length} already recorded in archive`)
      return urls
    })
    .catch(handleRequestError)
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
  for (let i = 0; i < chunks.length; i++) {
    const urls = chunks[i]
    await Promise.all(urls.map(downloadInsta))
  }
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
