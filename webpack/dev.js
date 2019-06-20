const merge = require('webpack-merge');
const common = require('./common.js');
const webpack = require('webpack');

module.exports = merge(common, {
  devtool: 'inline-source-map',
  mode: 'development',
  devServer: {
    contentBase: './dist',
    host: '0.0.0.0',
    hot: true,
    inline: true,
    port: 3104,
    publicPath: '/'
  },
  plugins: [new webpack.HotModuleReplacementPlugin()]
});
