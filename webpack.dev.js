const path = require('path');
const _ = require('lodash');
const webpack = require('webpack');

const globalIncludeExcludeRules = {
  include: [
    path.resolve(__dirname, "src"),
  ],
  exclude: [
    path.resolve(__dirname, "src/third-party"),
  ],
};

module.exports = {
  entry: {
    'web-gis-components': './src/web-gis-components.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  module: {
    rules: [

      // # Loaders for our source code.

      _.merge({}, globalIncludeExcludeRules, {
        test: /\.css$/,
        use: [
          "css-loader",
        ],
      }),
      _.merge({}, globalIncludeExcludeRules, {
        test: /\.less$/,
        use: [
          "css-loader",
          {
            loader: "less-loader",
            options: {
              strictMath: true,
              noIeCompat: true,
            },
          },
        ],
      }),
      _.merge({}, globalIncludeExcludeRules, {
        test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
        loader: "url-loader",
        options: {
          limit: 10000
        },
      }),
      _.merge({}, globalIncludeExcludeRules, {
        test: /\.html$/,
        use: [
          "html-loader",
        ],
      }),
      _.merge({}, globalIncludeExcludeRules, {
        test: /\.js$/,
        use: [
          "babel-loader",
          "eslint-loader",
        ],
      }),

    ],
  },
  resolve: {
    modules: [
      path.resolve('./src'),
      path.resolve('./node_modules'),
    ],
  },
  target: "web",
  plugins:[
    new webpack.DefinePlugin({
        // Set to `true` to dramatically increase the logs.
        VERBOSE: true,
    }),
  ],
};
