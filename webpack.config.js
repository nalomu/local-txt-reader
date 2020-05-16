const path = require('path')
const WebpackUserscript = require('webpack-userscript')
module.exports = env => {
  const dev = env.NODE_ENV === 'development'
  const local = env.local
  return {
    mode: dev ? 'development' : 'production',
    entry: path.resolve(__dirname, 'src', 'index.js'),
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: `Nalomu local TXT reader.${local ? 'local' : 'cdn'}.user.js`
    },
    devServer: {
      contentBase: path.join(__dirname, 'dist')
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src/')
      }
    },
    plugins: [
      new WebpackUserscript({
        headers: {
          name: 'Nalomu local TXT reader',
          version: dev ? `[version]-build.[buildNo]` : `[version]`,
          match: 'file:///*.txt',
          grant: [
            'GM_setValue',
            'GM_getValue'
          ],
          description: '在本地浏览器阅读TXT小说吧！',
          author: 'Nalomu',
          require: local ? '' : ['https://cdn.jsdelivr.net/npm/vue@2.6.11']
        },
        pretty: false
      })
    ],
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            'style-loader',
            'css-loader'
          ]
        }
      ]
    },
    externals: local ? {} : {
      'vue/dist/vue.esm': 'Vue'
    }
  }
}
