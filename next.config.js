require('dotenv').config()

module.exports = {
  env: {
    MATOMO_CONFIG: process.env.MATOMO_CONFIG,
    JITSI_CONFIG: process.env.JITSI_CONFIG,
  },
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      config.plugins.push(new webpack.ProvidePlugin({
        $: 'jquery',
        JitsiMeetJS: __dirname + '/dist/lib-jitsi-meet.min.js'
      }))
    }

    return config
  }
}
