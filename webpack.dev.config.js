var webpack = require('webpack');
var path = require('path');

module.exports = {
    entry: [
        './src/index.js',
        'webpack-dev-server/client?http://0.0.0.0:4000',
        'webpack/hot/only-dev-server',
        './src/style.css'
    ],
    
    output: {
        path: '/',
        filename: 'bundle.js'
    },
    
    devServer: {
        hot: true,
        filename: 'bundle.js',
        publicPath: '/',
        historyApiFallback: true,
        contentBase: './public',
        proxy: {
            '/api': 'http://localhost:3000'
        },
        stats: {
            assets: false,
            colors: true,
            version: false,
            hash: false,
            timings: false,
            chunks: false,
            chunksModules: false
        }
    },
    
    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ],
    
    module: {
        loaders: [
            {
                test:/\.js$/,
                loaders:['react-hot-loader', 'babel-loader?' + JSON.stringify({
                    cacheDirectory: true,
                    presets: ['es2015', 'react']
                })],
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader'
            }
        ]
    },
    
    resolve: {
        modules: [
            path.resolve('./src'),
            'node_modules'
        ]
    }
};