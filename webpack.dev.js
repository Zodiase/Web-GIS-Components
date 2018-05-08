const path = require('path');
const _ = require('lodash');
const webpack = require('webpack');

const globalIncludeExcludeRules = {
  include: [
    path.resolve(__dirname, 'src'),
  ],
};

module.exports = {
  target: 'web',
  entry: {
    'web-gis-elements': './src/web-gis-elements.js',
  },
  output: {
    path: path.resolve(__dirname, process.env.DISTDIR || 'dist'),
    filename: '[name].js',
  },
  resolve: {
    modules: [
      path.resolve('./src'),
      path.resolve('./node_modules'),
    ],
  },
  module: {
    rules: [

      // # Loaders for our source code.

      _.merge({}, globalIncludeExcludeRules, {
        test: /\.css$/,
        use: [
          'css-loader',
          'postcss-loader',
        ],
      }),
      _.merge({}, globalIncludeExcludeRules, {
        test: /\.less$/,
        use: [
          'css-loader',
          'postcss-loader',
          {
            loader: 'less-loader',
            options: {
              strictMath: true,
              noIeCompat: true,
            },
          },
        ],
      }),
      _.merge({}, globalIncludeExcludeRules, {
        test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
        loader: 'url-loader',
        options: {
          limit: 10000
        },
      }),
      _.merge({}, globalIncludeExcludeRules, {
        test: /\.html$/,
        use: [
          'html-loader',
        ],
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
  devtool: 'cheap-module-eval-source-map',
  plugins: [
    new webpack.DefinePlugin({
      // Set to `true` to dramatically increase the logs.
      VERBOSE: true,
    }),
  ],
};
