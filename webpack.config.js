const webpack = require('webpack');
const path = require('path');

const config = {
    module: {
        rules: [{
            test: /.(js|jsx)$/,
            use: 'babel-loader',
            exclude: '/node_modules/'
        }]
    },
    resolve: {
        extensions: ['.js', '.jsx']
    },
    devServer: {
        contentBase: './dist'
    },
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    }
}