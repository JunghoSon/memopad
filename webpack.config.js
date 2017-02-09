var path = require('path');

module.exports = {
    entry: [
        './src/index.js',
        './src/style.css'
    ],
    
    output: {
        path: __dirname + '/public/',
        filename: 'bundle.js'
    },
    
    module: {
        loaders: [
            {
                test:/\.js$/,
                loaders:['react-hot', 'babel?' + JSON.stringify({
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
        //root: path.resolve('./src')
        modules: [
            path.resolve('./src'),
            'node_modules'
        ]
    }
};