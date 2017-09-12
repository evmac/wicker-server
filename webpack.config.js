module.exports = {
  entry: './assets/js/Index.jsx',
  output: {
    path: `${__dirname}/public`,
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.jsx$/,
        loader: 'babel-loader'
      }
    ]
  }
};
