const Koa = require('koa')
const KoaRouter = require('koa-router')
const KoaStatic = require('koa-static')
const bodyParser = require('koa-bodyparser')
const session = require('koa-session')
const fs = require('fs')
const path = require('path')

const runCmd = require('./utils/runCmd')

const app = new Koa()
const router = new KoaRouter()

const arg = fs.readFileSync('args.json').toString()
const argInfo = JSON.parse(arg)

app.use(bodyParser()) // 处理 post 请求参数

app.keys = ['some secret hurr']
const CONFIG = {
  key: 'koa:sess' /** (string) cookie key (default is koa:sess) */,
  /** (number || 'session') maxAge in ms (default is 1 days) */
  /** 'session' will result in a cookie that expires when session/browser is closed */
  /** Warning: If a session cookie is stolen, this cookie will never expire */
  maxAge: 0.5 * 3600 * 1000, // 0.5h
  overwrite: true /** (boolean) can overwrite or not (default true) */,
  httpOnly: true /** (boolean) httpOnly or not (default true) */,
  signed: true /** (boolean) signed or not (default true) */,
  rolling: false /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */,
  renew: false /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
}

// 开启socket服务
const socketList = []
const server = require('http').Server(app.callback())
const socketIo = require('socket.io')(server)
socketIo.on('connection', (socket) => {
  socketList.push(socket)
  console.log('a user connected')
})

app.use(session(CONFIG, app))

router.get('/isLogin', async (ctx) => {
  const { isLogin } = ctx.session
  ctx.body = {
    data: isLogin,
    code: isLogin ? 0 : -1,
    msg: isLogin ? '已登录' : '未登录'
  }
})

router.post('/login', async (ctx) => {
  let code = 0
  let msg = '登录成功'
  let { password } = ctx.request.body
  if (password === `${argInfo.password}`) {
    ctx.session.isLogin = true
  } else {
    code = -1
    msg = '密码错误'
  }
  ctx.body = {
    code,
    msg
  }
})

router.post('/deploy', async (ctx) => {
  if (!ctx.session.isLogin) {
    ctx.body = {
      code: -2,
      msg: '未登录'
    }
    return
  }
  let execFunc = () => {
    return new Promise((resolve, reject) => {
      try {
        runCmd(
          'sh',
          ['./deploy-master.sh'],
          function (text) {
            resolve(text)
          },
          socketIo
        )
      } catch (e) {
        reject(e)
      }
    })
  }
  try {
    let res = await execFunc()
    ctx.body = {
      code: 0,
      msg: res
    }
  } catch (error) {
    ctx.body = {
      code: -1,
      msg: error.message
    }
  }
})

app.use(router.routes()).use(router.allowedMethods())
app.use(new KoaStatic(path.resolve(__dirname, '../frontend')))
server.listen(argInfo.port, () =>
  console.log(`serve is listening in ${argInfo.port}`)
)
