const child_process = require("child_process");
const path = require("path");

const Dotenv = require('dotenv-webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const webpack = require('webpack');

const isProduction = process.env.NODE_ENV == "production";

function git_version() {
  return child_process.execSync('git describe --always', { encoding: 'utf8' }).trim();
}

const config = {
  entry: "./codemancer/js/index.ts",
  output: {
    path: path.resolve(__dirname, "dist"),
  },
  devtool: 'inline-source-map',
  plugins: [
    new Dotenv(),
    new MiniCssExtractPlugin(),
    new webpack.EnvironmentPlugin({
      GIT_VERSION: git_version(),
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        loader: "ts-loader",
        options: {
          onlyCompileBundledFiles: true,
        },
        exclude: ["/node_modules/"],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: "asset",
      },
      {
        test: /.s?css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js", "..."],
  },
  optimization: {
    minimizer: [
      "...",
      new CssMinimizerPlugin(),
    ],
  },
};

module.exports = () => {
  if (isProduction) {
    config.mode = "production";
  } else {
    config.mode = "development";
  }
  return config;
};
