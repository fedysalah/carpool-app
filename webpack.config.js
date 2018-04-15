const webpack = require('webpack');
const { resolve } = require('path');
const secret = require('./secret');

const isProd = process.env.NODE_ENV === 'production';

const devPlugins = [
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.DefinePlugin({
        '__FIREBASE_API_KEY__': '\"' + secret.apiKey + '\"',
        '__FIREBASE_AUTH_DOMAIN__': '\"' + secret.authDomain + '\"',
        '__FIREBASE_DB_URL__': '\"' + secret.databaseURL + '\"',
        '__FIREBASE_PROJECT_ID__': '\"' + secret.projectId + '\"',
        '__FIREBASE_STORAGE_BUCKET__': '\"' + secret.storageBucket + '\"',
        '__FIREBASE_MESSAGING_SENDER_ID__': '\"' + secret.messagingSenderId + '\"',
        '__DEV__':  true,
        'process.env': { NODE_ENV: JSON.stringify('dev') }
    }),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
];
const prodPlugins = [
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
        '__FIREBASE_API_KEY__': '\"' + secret.apiKey + '\"',
        '__FIREBASE_AUTH_DOMAIN__': '\"' + secret.authDomain + '\"',
        '__FIREBASE_DB_URL__': '\"' + secret.databaseURL + '\"',
        '__FIREBASE_PROJECT_ID__': '\"' + secret.projectId + '\"',
        '__FIREBASE_STORAGE_BUCKET__': '\"' + secret.storageBucket + '\"',
        '__FIREBASE_MESSAGING_SENDER_ID__': '\"' + secret.messagingSenderId + '\"',
        '__DEV__':  false,
        'process.env': { NODE_ENV: JSON.stringify('production') }
    }),
];

module.exports = {
    output: {
        path: resolve(__dirname, './dist/'),
        publicPath: '/assets/',
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
    plugins: isProd ? prodPlugins : devPlugins
};