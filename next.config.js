require("dotenv").config();

module.exports = {
  env: {
    MATOMO_CONFIG: process.env.MATOMO_CONFIG,
    JITSI_CONFIG: process.env.JITSI_CONFIG
  },
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      // lib-jitsi-meet expects globals so give it the globals it craves
      config.plugins.push(
        new webpack.ProvidePlugin({
          $: "jquery",
          JitsiMeetJS: __dirname + "/dist/lib-jitsi-meet.min.js"
        })
      );
    }

    config.module.rules.push({
      test: /\.svg$/,
      issuer: {
        test: /\.tsx?$/
      },
      use: [
        {
          loader: "@svgr/webpack",
          options: {
            icon: true
          }
        }
      ]
    });

    return config;
  }
};
