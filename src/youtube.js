#!/usr/bin/env node

const { download } = require('./download')
const { videoPaths } = require('./video-paths')
const env = require('../env')

const authOpts = {
  authenticated: true,
  username: 'vincent_c64@hotmail.fr',
  password: env.ytpwd,
}

const playlists = [
  {
    output: videoPaths.drum_to_transcribe,
    url: buildPlaylistUrl('PLDhUIscho1EkmdxCU1agtKspnuKIRMt_V'),
  },
  {
    output: videoPaths.drum_lessons,
    url: buildPlaylistUrl('PLDhUIscho1ElAGkWJ6H_gqsv0xqi8EXLS'),
  },
]

function main() {
  playlists.forEach(({ output, url }) => download(authOpts)(output)(url))
}

function buildPlaylistUrl(playlistId) {
  return 'https://www.youtube.com/playlist?list=' + playlistId
}

main()
