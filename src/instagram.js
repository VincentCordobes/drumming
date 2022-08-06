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

async function getVideoUrlsFromApi(maxId = '', total = 0) {
  try {
    const { data } = await axios.get(
      `https://i.instagram.com/api/v1/feed/saved/posts/?max_id=${maxId}`,
      {
        headers: {
          'user-agent': 'Instagram 219.0.0.12.117 Android',
          Cookie,
        },
      }
    )

    const hasNext = data.more_available
    const nextMaxId = data.next_max_id

    const urls = data.items.map((item) => buildUrl(item.media.code))

    const totalUrls = total + urls.length
    console.info(`Total urls: ${totalUrls}`)

    if (hasNext && totalUrls < COUNT) {
      const nextUrls = await getVideoUrlsFromApi(nextMaxId, totalUrls)
      return [...urls, ...nextUrls]
    } else {
      return urls
    }
  } catch (e) {
    handleRequestError(e)
  }
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

  let statusCodes = []
  for (const url of urls) {
    console.info('Downloading', url)
    const code = await downloadInsta(url)
    statusCodes.push(code)
  }

  handleError(statusCodes)
}

function buildUrl(code) {
  return `https://www.instagram.com/p/${code}/`
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
