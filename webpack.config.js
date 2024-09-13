const path = require('path');

module.exports = {
  entry: {
    background: './background.js',
    popup: './popup/popup.js',
    expanded: './expand/expanded.js'
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true // Clean the output directory before emit
  },
  mode: 'production', // Use 'development' for debugging
  devtool: 'source-map',
  optimization: {
    minimize: false
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      config: path.resolve(__dirname, 'config.js'),
    },
  }
};
