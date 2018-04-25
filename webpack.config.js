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
    new SWPrecacheWebpackPlugin({
            // By default, a cache-busting query parameter is appended to requests
            // used to populate the caches, to ensure the responses are fresh.
            // If a URL is already hashed by Webpack, then there is no concern
            // about it being stale, and the cache-busting can be skipped.
            cacheId: 'the-magic-cache',
            filepath: resolve(__dirname, './public/serviceworker.js'),
            minify: false,
            // For unknown URLs, fallback to the index page
            navigateFallback: '/',
            mergeStaticsConfig: true,
            stripPrefixMulti: {
                [resolve(__dirname, './public/')]: '',
            },
            staticFileGlobs: [
                resolve(__dirname, './public/index.html'),
                resolve(__dirname, './public/javascripts/bundle/*.js'),
                resolve(__dirname, './public/ratchet/css/*.css'),
                resolve(__dirname, './public/ratchet/fonts/*.eot'),
                resolve(__dirname, './public/ratchet/fonts/*.svg'),
                resolve(__dirname, './public/ratchet/fonts/*.ttf'),
                resolve(__dirname, './public/ratchet/fonts/*.woff'),
                resolve(__dirname, './public/ratchet/js/*.js'),
                resolve(__dirname, './public/images/icons/**.*'),
                resolve(__dirname, './public/images/icons-trans/**.*'),
                resolve(__dirname, './public/images/*.png')
            ],
            importScripts: [
                 '../../firebase-messaging.js',
             ],
            runtimeCaching: [{
                urlPattern: /\/users/,
                handler: 'networkFirst'
            }, {
                urlPattern: /\/archive/,
                handler: 'networkFirst'
            }, {
                urlPattern: /\/locationTime/,
                handler: 'networkFirst'
            },
            {
                urlPattern: /https:\/\/www\.gstatic\.com\/firebasejs\//,
                handler: 'networkFirst'
            }]
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