require('dotenv').config()

module.exports = {
  env: {
    MATOMO_CONFIG: process.env.MATOMO_CONFIG,
    JITSI_CONFIG: process.env.JITSI_CONFIG,
  }
}
