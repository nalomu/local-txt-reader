const path = require('path')
const WebpackUserscript = require('webpack-userscript')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
module.exports = env => {
  const dev = env.NODE_ENV === 'development'
  const local = env.local
  const filename = `Nalomu local TXT reader.${local ? 'local' : 'cdn'}.user.js`
  const vueCdn = dev
    ? 'https://unpkg.com/vue@2.6.11/dist/vue.js'
    : 'https://cdn.jsdelivr.net/npm/vue@2.6.11'
  const externalHeader = dev ? ['GM_xmlhttpRequest'] : []
  console.log(vueCdn)
  return {
    mode: dev ? 'development' : 'production',
    entry: [path.resolve(__dirname, 'src', 'main.ts')],
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename
    },
    devServer: {
      contentBase: path.join(__dirname, 'dist')
    },
    resolve: {
      extensions: ['.js', '.vue', '.json', '.ts'],
      alias: {
        '@': path.resolve(__dirname, 'src/')
      }
    },
    plugins: [
      new WebpackUserscript({
        headers: {
          name: 'Nalomu local TXT reader',
          version: dev ? '[version]-build.[buildNo]' : '[version]',
          updateURL: dev ? `http://127.0.0.1:8080/${filename}` : undefined,
          match: 'file:///*.txt',
          grant: [
            'GM_setValue',
            'GM_getValue',
            ...externalHeader
          ],
          description: '在本地浏览器阅读TXT小说吧！',
          author: 'Nalomu',
          require: local ? ''
            : [vueCdn],
          'run-at': 'document-body'
        },
        pretty: false,
        proxyScript: {
          baseUrl: 'http://127.0.0.1:8080/',
          filename: '[basename].proxy.user.js',
          enable: dev
        }
      }),
      // 请确保引入这个插件！
      new VueLoaderPlugin()
    ],
    module: {
      rules: [{
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'style-loader',
          'css-loader'
        ]
      }, {
        test: /\.scss$/,
        use: [
          'vue-style-loader',
          'style-loader', // 将 JS 字符串生成为 style 节点
          'css-loader', // 将 CSS 转化成 CommonJS 模块
          'sass-loader' // 将 Sass 编译成 CSS，默认使用 Node Sass
        ]
      }, {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          'file-loader'
        ]
      }, {
        test: /\.vue$/,
        loader: 'vue-loader'
      }, {
        test: /\.ts$/,
        exclude: /node_modules/,
        enforce: 'pre',
        loader: 'tslint-loader'
      }, {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          appendTsSuffixTo: [/\.vue$/]
        }
      }]

    },
    externals: local ? {} : {
      'vue/dist/vue.esm': 'Vue'
    }
  }
}
