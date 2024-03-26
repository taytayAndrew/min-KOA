const http = require('http')
const context = require('./context')
const request = require('./request')
const response = require('./response')
const Stream = require('stream').Stream;

class Application {
    constructor() {
        this.middleware = [] //保存用户添加中间件函数
        this.context = Object.create(context)//为了不让其中任意一种实例来改变类中的数据，要拷贝一层
        this.request = Object.create(request)
        this.response = Object.create(response)
    }
    listen(...args) {
        const server = http.createServer(this.callback())
        server.listen(...args)
    }
    use(fn) {
        this.middleware.push(fn)
    }
    //异步递归遍历调用中间件处理函数
    compose(middleware) {
        return function (context) {//可以多传一部分参数
            const dispatch = index => {
                if (index >= middleware.length) return Promise.resolve()
                const fn = middleware[index]//中间件的处理函数 由于中间件不是异步不返回promise 所以我们要统一转换成promise
                return Promise.resolve(fn(context, () => dispatch(index + 1)))//中间件获取两个参数ctx,next
                //由于我们将返回值强行转成了Promise 所以dispatch返回的是promise 而next需要是函数 所以要用匿名函数来包裹
            }

            return dispatch(0)//用来返回第一个中间件处理函数
        }
    }
    createContext(req, res) {
        const context = Object.create(this.context)
        const request = context.request = Object.create(this.request)
        const response = context.response = Object.create(this.response)//Object.create克隆的对象也只能实现一级对象的深拷贝。
        context.app = request.app = response.app = this
        context.req = request.req = response.req = req
        context.res = request.res = response.res = res
        request.ctx = response.ctx = context
        request.response = response
        response.request = request
        // context.originalUrl = request.originalUrl = req.url
        context.state = {}
        return context
    }

    callback() {
        const fnMiddleware = this.compose(this.middleware)
        //每个请求都创建单独的ctx上下文对象，它们之间不会相互污染
        const handleRequest = (req, res) => {
            const context = this.createContext(req, res)
            fnMiddleware(context).then(() => {
                // res.end(context)
                respond(context)
            }).catch(err => {
                res.end(err.message)
            })
        }
        return handleRequest
    }
}

function respond(ctx) {
    const body = ctx.body
    const res = ctx.res

    if (typeof body === 'string') return res.end(body)
    if (Buffer.isBuffer(body)) return res.end(body)//Buffer类型
    if (body instanceof Stream) return body.pipe(ctx.res)//可读流
    if (typeof body === 'number') return res.end(body + '')//数字要转成字符串再发送
    if (typeof body === 'object') {
        const jsonStr = JSON.stringify(body)//转成JSON格式再发送
        return res.end(jsonStr)
    }
    res.statecode = 204
    res.end()//结束响应
}

module.exports = Application