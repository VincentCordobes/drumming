#!/usr/bin/env node

const { download } = require('./download')
const { videoPaths, BASE_PATH } = require('./video-paths')
const { ensurePathExists } = require('./ensure-path-exists')
const { handleError } = require('./error-handler')

const authOpts = {
  cookie: 'youtube.txt',
}

const playlists = [
  // {
  //   output: videoPaths.drum_to_transcribe,
  //   url: buildPlaylistUrl('PLDhUIscho1EkmdxCU1agtKspnuKIRMt_V'),
  // },
  // {
  //   output: videoPaths.drum_lessons,
  //   url: buildPlaylistUrl('PLDhUIscho1ElAGkWJ6H_gqsv0xqi8EXLS'),
  // },
  {
    output: videoPaths.piano_lessons,
    url: buildPlaylistUrl('PLDhUIscho1EkZFyTcCg2clexSlkfMk11G'),
  },
  {
    output: videoPaths.piano,
    url: buildPlaylistUrl('PLDhUIscho1EkaVZT-pNkG2cxQ3q-p1Jpw'),
  },
]

async function main() {
  ensurePathExists(BASE_PATH)
  const statusCodes = await Promise.all(
    playlists.map(({ output, url }) => download(authOpts)(output)(url))
  )
  handleError(statusCodes)
}

function buildPlaylistUrl(playlistId) {
  return 'https://www.youtube.com/playlist?list=' + playlistId
}

main()
