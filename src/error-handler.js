function handleError(statusCodes) {
  const errorCode = statusCodes.find(code => code !== 0)

  if (errorCode !== null) {
    process.exit(errorCode)
  }
}

module.exports = {
  handleError,
}
