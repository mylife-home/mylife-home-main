const path = require("path");
const FilterWarningsPlugin = require("webpack-filter-warnings-plugin");

module.exports = {
  entry: "./src/index.ts",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/
      },
      { test: /\.js$/, loader: "shebang-loader" } // npm i -D shebang-loader
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  },
  output: {
    path: path.resolve(__dirname, "dist")
  },
  target: "node",
  plugins: [
    new FilterWarningsPlugin({
      exclude: [
        /Module not found\: Error\: Can't resolve 'bufferutil' in '\/Users\/vincent\/workspace\/private\/sandbox\/home\-mqtt\/node_modules\/ws\/lib'/,
        /Module not found\: Error\: Can't resolve 'utf-8-validate' in '\/Users\/vincent\/workspace\/private\/sandbox\/home\-mqtt\/node_modules\/ws\/lib'/
      ]
    })
  ]
};
