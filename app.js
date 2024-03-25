const Koa = require('./koa')
const app = new Koa()

app.use(async (ctx, next) => {
    // console.log(ctx.request.method)
    ctx.body = 'hello there'
    next()

})
app.use(async (ctx, next) => {
    console.log(ctx.response.body)
    // ctx.body = 'hello there'
    ctx.body = 'hello koa2'

})
app.listen(3000)