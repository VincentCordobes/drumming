const fs = require('fs')
const videos = fs.readdirSync('./')

const random = Math.floor(Math.random() * videos.length-1)
const pickedVideo = videos[random]
console.log(pickedVideo)
