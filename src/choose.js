#!/usr/bin/env node

const fs = require('fs')
const os = require('os')
const path = require('path')
const { spawn } = require('child_process')
const { DateTime } = require('luxon')
const { flatMap } = require('lodash/fp')
const { videoPaths, BASE_PATH } = require('./video-paths')

const todoFilePath = path.join(os.homedir(), 'Dropbox/wiki/drum_todo.md')

function getVideos(videoPaths) {
  return flatMap(path => fs.readdirSync(path), videoPaths)
}

function getVideosRec(videoPath) {
  const isDir = fs.statSync(videoPath).isDirectory()
  if (!isDir) {
    const isMp4 = /.*.mp4/.test(videoPath)
    return isMp4 ? [videoPath] : []
  }

  const paths = fs.readdirSync(videoPath)
  return flatMap(p => getVideosRec(path.join(videoPath, p)), paths)
}

function main() {
  const videos = getVideosRec(videoPaths.static).map(fullPath =>
    fullPath.replace(videoPaths.static, '')
  )
  const todosContent = fs.readFileSync(todoFilePath)

  let pickedVideo
  do {
    const random = Math.floor(Math.random() * videos.length)
    pickedVideo = videos[random]
  } while (todosContent.indexOf(pickedVideo) !== -1)

  console.log(`Adding ${pickedVideo} to drum_todo...`)
  const item = `
${pickedVideo}
> ${DateTime.local().toISODate()}
`
  // fs.appendFileSync(todoFilePath, item)
}

main()
