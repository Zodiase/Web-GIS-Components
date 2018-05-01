const path = require('path');
const _ = require('lodash');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

const globalIncludeExcludeRules = {
  include: [
    path.resolve(__dirname, 'src'),
  ],
};

module.exports = {
  target: 'node',
  resolve: {
    modules: [
      path.resolve('./src'),
      path.resolve('./node_modules'),
    ],
  },
  externals: [
    nodeExternals(),
  ],
  module: {
    rules: [

      // # Loaders for our source code.

      _.merge({}, globalIncludeExcludeRules, {
        test: /\.css$/,
        loader: 'null-loader',
      }),
      _.merge({}, globalIncludeExcludeRules, {
        test: /\.less$/,
        loader: 'null-loader',
      }),
      _.merge({}, globalIncludeExcludeRules, {
        test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
        loader: 'null-loader',
      }),
      _.merge({}, globalIncludeExcludeRules, {
        test: /\.html$/,
        loader: 'null-loader',
      }),
      _.merge({}, globalIncludeExcludeRules, {
        test: /\.js$/,
        use: [
          'babel-loader',
          'eslint-loader',
        ],
      }),

    ],
  },
  devtool: 'inline-cheap-module-source-map',
  plugins: [
    new webpack.DefinePlugin({
      // Set to `true` to dramatically increase the logs.
      VERBOSE: true,
    }),
  ],
};
