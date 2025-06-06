import child_process from 'child_process';
import path from 'path';
import process from 'process';

import Dotenv from 'dotenv-webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import webpack from 'webpack';
import type {Configuration} from 'webpack';

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
  },
  devtool: 'source-map',
  plugins: [
    new Dotenv(),
    new MiniCssExtractPlugin(),
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
  } else {
    config.mode = 'development';
  }
  return config;
};
