const webpack = require('webpack');
const { resolve } = require('path');

const isProd = process.env.NODE_ENV === 'production';
let secret;
if (!isProd) {
    secret = require('./secret');
}

const devPlugins = [
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.DefinePlugin({
        '__DEV__':  true,
        'process.env': {
            NODE_ENV: JSON.stringify('dev'),
            FIREBASE_API_KEY: JSON.stringify(secret.apiKey),
            FIREBASE_AUTH_DOMAIN: JSON.stringify(secret.authDomain),
            FIREBASE_DB_URL : JSON.stringify(secret.databaseURL),
            FIREBASE_PROJECT_ID : JSON.stringify(secret.projectId),
            FIREBASE_STORAGE_BUCKET : JSON.stringify(secret.storageBucket),
            FIREBASE_MESSAGING_SENDER_ID : JSON.stringify(secret.messagingSenderId)
        }
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