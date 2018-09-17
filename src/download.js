const { spawn } = require('child_process')

const OUTPUT_TEMPLATE = '%(title)s-%(id)s.%(ext)s'

function download(authOpts = {}) {
  const authParams = authOpts.authenticated
    ? ['--username', authOpts.username, '--password', authOpts.password]
    : []

  return outputPath => url =>
    new Promise(resolve => {
      const child = spawn('youtube-dl', [
        url,
        '-o',
        outputPath + '/' + OUTPUT_TEMPLATE,
        ...authParams,
      ])
      child.stdout.on('data', data => {
        process.stdout.write(data)
      })
      child.on('close', code => {
        resolve()
      })
    })
}

module.exports = {
  download,
}
