const logger = require('./logger')

function runCmd(cmd, args, callback, socketIo) {
  const { spawn } = require('child_process')
  const child = spawn(cmd, args)

  let resp = '当前执行路径：' + process.cwd() + '\n'
  logger.info(resp)
  socketIo && socketIo.emit('deploy-log', `${resp}`)
  child.stdout.on('data', (data) => {
    // 在此处收集shell执行的log
    let info = data.toString()
    info = `${new Date().toLocaleString()}: ${info}`
    resp += info
    logger.info(info)
    socketIo && socketIo.emit('deploy-log', `${info}`)
  })

  child.stdout.on('end', (data) => {
    callback(resp)
  })

  child.stderr.on('data', (data) => {
    let info = data.toString()
    info = `${new Date().toLocaleString()}: ${info}`
    resp += info
    logger.info(info)
    socketIo && socketIo.emit('deploy-log', `${info}`)
  })

  child.stderr.on('end', (data) => {
    callback(resp)
  })
}

module.exports = runCmd
