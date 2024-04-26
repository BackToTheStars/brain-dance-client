const getShortLink = (url) => {
  try {
    const shortLink = new URL(url).hostname;
    return shortLink
  } catch (err) {
    return url;
  }
}

module.exports = {
  getShortLink
}