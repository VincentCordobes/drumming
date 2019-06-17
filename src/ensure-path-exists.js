const fs = require('fs')

function ensurePathExists(path) {
  if (!fs.existsSync(path)) {
    console.log(`Error: Cannot access '${path}'. 
       Make sure that path exists.`)
    process.exit(1)
  }
}

module.exports = {
  ensurePathExists,
}
