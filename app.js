const Koa = require('./koa')
const app = new Koa()
const fs = require('fs');
const util = require('util')
const readFile = util.promisify(fs.readFile)


app.use(async (ctx, next) => {
    // console.log(ctx.request.method)
    // ctx.body = 'hello there'
    // next()

    // ctx.body = 132

    // const data = await readFile('./package.json')
    // ctx.body = data

    ctx.body = fs.createReadStream('./package.json')

})
app.use(async (ctx, next) => {
    console.log(ctx.response.body)
    // ctx.body = 'hello there'
    // ctx.body = 'hello koa2'


})
app.listen(3000)