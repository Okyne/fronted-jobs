const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: './src/main.tsx',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'main.js',
        publicPath: '/dist/'
    },
    resolve: {
        extensions: ['.js', '.ts', '.tsx']
    },
    devServer: {
        noInfo: true,
        port: 8080
    },
    node: {
        fs: 'empty'
    },
    module: {
        rules: [
            {
                test: /\.scss$/,  
                exclude: [/node_modules/],
                loaders: ['style-loader', 'css-loader', 'sass-loader']
            },
            {
                test: /\.tsx?/,
                loader: 'tslint-loader',
                enforce: 'pre',
                exclude: [/node_modules/]
            },
            {
                test: /\.tsx?/,
                loader: 'ts-loader',
                exclude: [/node_modules/]
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(process.env.NODE_ENV)
            }
        })
    ]
}