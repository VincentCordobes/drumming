#!/usr/bin/env node

const fs = require('fs')
const os = require('os')
const path = require('path')
const { spawn } = require('child_process')
const { DateTime } = require('luxon')
const { flatMap } = require('lodash/fp')
const { videoPaths, BASE_PATH } = require('./video-paths')

const todoFilePath = path.join(os.homedir(), 'Dropbox/wiki/drum_todo.m3u')

/**
 * @param {string} videoPath root dir
 * @returns {string[]} videos paths
 */
function getVideosRec(videoPath) {
  const isDir = fs.statSync(videoPath).isDirectory()
  if (!isDir) {
    const isMp4 = /.*.mp4/.test(videoPath)
    return isMp4 ? [videoPath] : []
  }

  const paths = fs.readdirSync(videoPath)
  return flatMap(p => getVideosRec(path.join(videoPath, p)), paths)
}

/**
 * @param {string} path of the file
 * @returns {string[]} videos paths
 */
function readFile(path) {
  const videoRegex = /^(\/.*)/gm

  const todosContent = fs.readFileSync(path)

  let videos = []
  let res
  while ((res = videoRegex.exec(todosContent)) !== null) {
    const [_, uri] = res
    videos.push(uri)
  }
  return videos
}

/**
 * @returns {string} a random video path
 */
function pickNextTodo() {
  const path = getPath()
  const videos = getVideosRec(path)
  const todosContent = fs.readFileSync(todoFilePath)

  let pickedVideo
  do {
    pickedVideo = pickRandom(videos)
  } while (todosContent.indexOf(pickedVideo) !== -1)

  return pickedVideo
}

function getPath() {
  const toSearch = process.argv[3]
  if (process.argv.includes('-f')) {
    return (
      Object.values(videoPaths).find(path => path.indexOf(toSearch) !== -1) ||
      BASE_PATH
    )
  } else {
    return BASE_PATH
  }
}

/**
 * param {string[]} videos
 * @returns {string} the randomly picked video
 */
function pickRandom(videos) {
  const random = Math.floor(Math.random() * videos.length)
  return videos[random]
}

function appendToFile(video, file) {
  const item = `${video}\n\n`
  fs.appendFileSync(file, item)
}

function print(paths) {
  paths.forEach(path => console.log(`"${path}"`))
}

function main() {
  const options = process.argv

  let pickedVideos
  if (process.argv.includes('-d')) {
    const allDone = readFile(todoFilePath)
    if (process.argv.includes('--all')) {
      pickedVideos = allDone
    } else {
      pickedVideos = pickRandom(allDone)
    }
  } else {
    pickedVideos = [pickNextTodo()]
    if (process.argv.includes('-w')) {
      appendToFile(pickedVideos, todoFilePath)
    }
  }
  print(pickedVideos)
}

main()
