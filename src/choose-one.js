const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");
const { DateTime } = require("luxon");

const VIDEO_DIR = "./saved_videos";
const TODO_DRUM_FILE = "Dropbox/wiki/drum_todo.md";

const videos = fs.readdirSync(VIDEO_DIR);

const random = Math.floor(Math.random() * videos.length - 1);
const pickedVideo = videos[random];
console.log("Picked video:", pickedVideo);

console.log("Adding it to drum_todo...");
const item = `
${pickedVideo}
> ${DateTime.local().toISODate()}
`;
const filePath = path.join(os.homedir(), TODO_DRUM_FILE);
fs.appendFileSync(filePath, item);
