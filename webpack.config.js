const path = require('path');
const _ = require('lodash');
const BabiliPlugin = require("babili-webpack-plugin");

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
    'web-gis-components-lite': './src/web-gis-components-lite.js',
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
  target: "web",
  plugins:[
//     new BabiliPlugin(),
  ],
};
