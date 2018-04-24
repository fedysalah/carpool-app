const webpack = require('webpack');
const {resolve} = require('path');
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');

const isProd = process.env.NODE_ENV === 'production';

let plugins;

if (isProd) {
    plugins = [
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
            '__DEV__': false,
            'process.env': {
                NODE_ENV: JSON.stringify('production'),
                FIREBASE_API_KEY: JSON.stringify(process.env.FIREBASE_API_KEY),
                FIREBASE_AUTH_DOMAIN: JSON.stringify(process.env.FIREBASE_AUTH_DOMAIN),
                FIREBASE_DB_URL: JSON.stringify(process.env.FIREBASE_DB_URL),
                FIREBASE_PROJECT_ID: JSON.stringify(process.env.FIREBASE_PROJECT_ID),
                FIREBASE_STORAGE_BUCKET: JSON.stringify(process.env.FIREBASE_STORAGE_BUCKET),
                FIREBASE_MESSAGING_SENDER_ID: JSON.stringify(process.env.FIREBASE_MESSAGING_SENDER_ID),
            }
        }),
        new SWPrecacheWebpackPlugin({
            // By default, a cache-busting query parameter is appended to requests
            // used to populate the caches, to ensure the responses are fresh.
            // If a URL is already hashed by Webpack, then there is no concern
            // about it being stale, and the cache-busting can be skipped.
            cacheId: 'the-magic-cache',
            dontCacheBustUrlsMatching: /\.\w{8}\./,
            //filename: 'park-service-worker.js',
            filepath: resolve(__dirname, './public/serviceworker.js'),
            logger(message) {
                if (message.indexOf('Total precache size is') === 0) {
                    // This message occurs for every build and is a bit too noisy.
                    return;
                }
                if (message.indexOf('Skipping static resource') === 0) {
                    // This message obscures real errors so we ignore it.
                    // https://github.com/facebookincubator/create-react-app/issues/2612
                    return;
                }
                console.log('message', message);
            },
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
                '../firebase-messaging.js',
            ],
            // Ignores URLs starting from /__ (useful for Firebase):
            // https://github.com/facebookincubator/create-react-app/issues/2237#issuecomment-302693219
            navigateFallbackWhitelist: [/^(?!\/__).*/],
            // Don't precache sourcemaps (they're large) and build asset manifest:
            staticFileGlobsIgnorePatterns: [/\.map$/, /asset-manifest\.json$/],

            runtimeCaching: [{
                urlPattern: /\/search/,
                handler: 'networkFirst'
            }, {
                urlPattern: /\/suggest/,
                handler: 'networkFirst'
            }]
        }),
    ];
} else {
    const secret = require('./secret');
    plugins = [
        new webpack.optimize.ModuleConcatenationPlugin(),
        new webpack.DefinePlugin({
            '__DEV__': true,
            'process.env': {
                NODE_ENV: JSON.stringify('dev'),
                FIREBASE_API_KEY: JSON.stringify(secret.apiKey),
                FIREBASE_AUTH_DOMAIN: JSON.stringify(secret.authDomain),
                FIREBASE_DB_URL: JSON.stringify(secret.databaseURL),
                FIREBASE_PROJECT_ID: JSON.stringify(secret.projectId),
                FIREBASE_STORAGE_BUCKET: JSON.stringify(secret.storageBucket),
                FIREBASE_MESSAGING_SENDER_ID: JSON.stringify(secret.messagingSenderId)
            }
        }),
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin(),
    ];
}


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