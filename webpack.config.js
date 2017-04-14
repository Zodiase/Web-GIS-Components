const path = require('path');
const BabiliPlugin = require("babili-webpack-plugin");

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
      {
        test: /\.html$/,
        include: [
          path.resolve(__dirname, "src"),
        ],
        exclude: [
          path.resolve(__dirname, "src/third-party"),
        ],
        use: [
          "html-loader",
        ],
      },
      {
        test: /\.js$/,
        include: [
          path.resolve(__dirname, "src"),
        ],
        exclude: [
          path.resolve(__dirname, "src/third-party"),
        ],
        use: [
          "babel-loader",
          "eslint-loader",
        ],
      },
    ],
  },
  target: "web",
  plugins:[
//     new BabiliPlugin(),
  ],
};
