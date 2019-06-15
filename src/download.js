const { spawn } = require('child_process')

const OUTPUT_TEMPLATE = '%(title)s-%(id)s.%(ext)s'

function download(authOpts = {}) {
  const authParams = authOpts.authenticated
    ? ['--username', authOpts.username, '--password', authOpts.password]
    : []

  return outputPath => url =>
    new Promise(resolve => {
      const child = spawn(
        'youtube-dl',
        [
          url,
          '-o',
          outputPath + '/' + OUTPUT_TEMPLATE,
          ...authParams,
          ...['--download-archive', outputPath + '/archive.txt'],
          '--ignore-errors',
        ],
        { stdio: 'inherit' }
      )
      child.on('close', code => {
        resolve(code)
      })
    })
}

module.exports = {
  download,
}
