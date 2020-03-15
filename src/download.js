const { spawn } = require('child_process')
const path = require('path')

const OUTPUT_TEMPLATE = '%(title)s-%(id)s.%(ext)s'

function download(authOpts = {}) {
  const authParams = authOpts.authenticated
    ? ['--username', authOpts.username, '--password', authOpts.password]
    : []

  const cookies = authOpts.cookie
    ? ['--cookies', path.join(__dirname, '../cookies', authOpts.cookie)]
    : []

  return outputPath => url =>
    new Promise((resolve, reject) => {
      const child = spawn(
        'youtube-dl',
        [
          url,
          '-o',
          outputPath + '/' + OUTPUT_TEMPLATE,
          ...authParams,
          ...cookies,
          ...['--download-archive', outputPath + '/archive.txt'],
          '--ignore-errors',
        ],
        { stdio: 'inherit' }
      )

      child.on('exit', code => {
        resolve(code)
      })

      child.on('error', e => {
        reject(e)
      })
    })
}

module.exports = {
  download,
}
