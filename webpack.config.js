const webpack = require('webpack');
const {resolve} = require('path');
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');

const isProd = process.env.NODE_ENV === 'production';

let plugins = [
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.LoaderOptionsPlugin({
        minimize: true,
        debug: false
    }),
    new webpack.optimize.UglifyJsPlugin({
        beautify: false,
        compress: {
            warnings: false,
            screw_ie8: true,
            conditionals: true,
            unused: true,
            comparisons: true,
            sequences: true,
            dead_code: true,
            evaluate: true,
            if_return: true,
            join_vars: true,
        },
        output: {
            comments: false,
        }
    }),
    new webpack.DefinePlugin({
        '__DEV__': !isProd,
        'process.env': {
            NODE_ENV: isProd ? JSON.stringify('production') : JSON.stringify('dev')
        }
    }),
];

module.exports = {
    output: {
        path: resolve(__dirname, './public/javascripts/bundle/'),
        publicPath: '/javascripts/bundle/',
        filename: 'carpool.js',
        library: 'CarPool',
        libraryTarget: 'umd'
    },
    entry: {
        'days': ['./src/main.js']
    },
    resolve: {
        extensions: ['.js'],
        modules: [
            resolve(__dirname, 'node_modules'),
            resolve(__dirname, 'src')
        ]
    },
    devServer: {
        port: process.env.DEV_SERVER_PORT || 3000
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            },
        ]
    },
    plugins
};