function runCmd(socketIo) {
  return new Promise((reslove, reject) => {
    const { spawn } = require('child_process')
    const child = spawn('sh', ['deploy-master.sh'])

    let msg = ''
    child.stdout.on('data', (data) => {
      // 在此处收集shell执行的log
      console.log(`stdout:${data}`)
      socketIo.emit('deploy-log', `${data}`)
      msg += data
    })

    child.stdout.on('end', (data) => {
      reslove(msg)
    })

    child.stderr.on('data', (data) => {
      console.log(`stderr:${data}`)
      socketIo.emit('deploy-log', `${data}`)
      msg += data
    })

    child.stderr.on('end', (data) => {
      reject(msg)
    })
  })
}

module.exports = runCmd
