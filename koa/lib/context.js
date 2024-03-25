const context = {
    // method: 'xxx',
    // get method() {
    //     return this.request.method
    // },
    // get url() {
    //     return this.request.method
    // },

}
defineProperty('request', 'method')
defineProperty('request', 'url')
defineProperty('response', 'body')

function defineProperty(target, name) {
    Object.defineProperty(context, name, {
        get() {
            return this[target][name]
        },
        set(value) {
            this[target][name] = value
        }
    })
}

module.exports = context