const fs = require('fs')
const runCmd = require('./server/utils/runCmd')
const logger = require('./server/utils/logger')

class JcDeploy {
  constructor() {}

  async start(args) {
    // 存储参数，用于多文件传参
    fs.writeFileSync('args.json', JSON.stringify(args))
    // 删除原先的服务
    runCmd('pm2', ['delete', 'jcdeploy'], () => {})
    // 防止异步并行，sleep 1s
    await new Promise((resolve) => setTimeout(resolve, 1000))
    // 开启 pm2 服务
    const argv = ['start', __dirname + '/server/index.js', '-n', 'jcdeploy']
    runCmd('pm2', argv, (text) => {
      logger.log(text)
    })
  }
}

module.exports = JcDeploy
