const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');

process.env.VUE_APP_VERSION = require('./package.json').version;

module.exports = {
  devServer: {
    disableHostCheck: true
  },
  pluginOptions: {
    webpackBundleAnalyzer: {
      openAnalyzer: false
    }
  },
  configureWebpack: {
    plugins: [new HardSourceWebpackPlugin()]
  }
};
