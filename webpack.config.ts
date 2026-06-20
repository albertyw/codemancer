import child_process from 'child_process';
import path from 'path';
import process from 'process';

import Dotenv from 'dotenv-webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import webpack from 'webpack';
import type {Configuration} from 'webpack';
import {WebpackManifestPlugin} from 'webpack-manifest-plugin';

const isProduction = process.env.NODE_ENV == 'production';

function gitVersion() {
  if (process.env.GIT_VERSION !== undefined) {
    return process.env.GIT_VERSION;
  }
  return child_process.execSync('git describe --always', { encoding: 'utf8' }).trim();
}

const config: Configuration = {
  entry: './codemancer/js/index.ts',
  output: {
    path: path.resolve('dist'),
    publicPath: '/dist/',
    // Content hashing in production lets browsers/CDNs cache assets forever:
    // any content change produces a new URL, so caches can never go stale.
    filename: isProduction ? '[name].[contenthash].js' : '[name].js',
    // Remove stale hashed builds, but keep the tracked dir-placeholder.
    clean: {keep: '.gitignore'},
  },
  plugins: [
    new Dotenv(),
    new MiniCssExtractPlugin({
      filename: isProduction ? '[name].[contenthash].css' : '[name].css',
    }),
    // Emits dist/manifest.json mapping logical names (main.js/main.css) to the
    // hashed output paths, which the server reads to render the index template.
    new WebpackManifestPlugin({}),
    new webpack.EnvironmentPlugin({
      GIT_VERSION: gitVersion(),
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        loader: 'ts-loader',
        options: {
          onlyCompileBundledFiles: true,
          // The bundle no longer transitively pulls in @types/node, so make
          // the node ambient types (e.g. `process`) explicit for this build.
          compilerOptions: {
            types: ['node'],
          },
        },
        exclude: ['/node_modules/'],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: 'asset',
      },
      {
        test: /.s?css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '...'],
    extensionAlias: {
      '.js': ['.ts', '.js'],
    },
  },
  optimization: {
    minimizer: [
      '...',
      new CssMinimizerPlugin(),
    ],
    usedExports: true,
  },
};

export default () => {
  if (isProduction) {
    config.mode = 'production';
    config.devtool = 'source-map';
  } else {
    config.mode = 'development';
    config.devtool = 'eval-cheap-module-source-map';
  }
  return config;
};
