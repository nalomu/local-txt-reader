const path = require('path')
const WebpackUserscript = require('webpack-userscript')
module.exports = env => {
  const dev = env.NODE_ENV === 'development'
  const local = env.local
  const filename = `Nalomu local TXT reader.${local ? 'local' : 'cdn'}.user.js`
  return {
    mode: dev ? 'development' : 'production',
    entry: path.resolve(__dirname, 'src', 'index.js'),
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename
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
          updateURL: dev ? `http://127.0.0.1:8080/${filename}` : undefined,
          match: 'file:///*.txt',
          grant: [
            'GM_setValue',
            'GM_getValue'
          ],
          description: '在本地浏览器阅读TXT小说吧！',
          author: 'Nalomu',
          require: local ? '' : ['https://cdn.jsdelivr.net/npm/vue@2.6.11']
        },
        pretty: false,
        proxyScript: {
          baseUrl: 'http://127.0.0.1:12345',
          filename: '[basename].proxy.user.js',
          enable: () => dev
        }
      })
    ],
    module: {
      rules: [{
        test: /\.css$/,
        use: [
          'style-loader',
          'styles-loader'
        ]
      }, {
        test: /\.scss$/,
        use: [
          'style-loader', // 将 JS 字符串生成为 style 节点
          'styles-loader', // 将 CSS 转化成 CommonJS 模块
          'sass-loader' // 将 Sass 编译成 CSS，默认使用 Node Sass
        ]
      }]

    },
    externals: local ? {} : {
      'vue/dist/vue.esm': 'Vue'
    }
  }
}
