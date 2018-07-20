const fs = require("fs");
const { spawn } = require("child_process");
const queries = require("../queries.json");
const chunk = require("lodash/fp/chunk");
const flatMap = require("lodash/fp/flatMap");
const map = require("lodash/fp/map");
const get = require("lodash/fp/get");
const flow = require("lodash/fp/flow");

const OUTPUT_DIR = "./saved_videos";

main();

async function main() {
  const urls = flow(
    flatMap(get("data.user.edge_saved_media.edges")),
    map(get("node.shortcode")),
    map(buildUrl)
  )(queries);

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
  }

  const chunks = chunk(4, urls);
  for (let i = 0; i < chunks.length; i++) {
    const urls = chunks[i];
    await Promise.all(urls.map(download));
  }
}

function buildUrl(shortcode) {
  return `https://www.instagram.com/p/${shortcode}/`;
}

function download(url) {
  return new Promise(resolve => {
    const child = spawn("youtube-dl", [
      url,
      "-o",
      `${OUTPUT_DIR}/%(title)s-%(id)s.%(ext)s`
    ]);
    child.stdout.on("data", data => {
      process.stdout.write(data);
    });
    child.on("close", code => {
      resolve();
    });
  });
}
