const Router = require('koa-router');
const api = new Router();
const auth = require('./auth');

api.use('/auth', auth.routes());

api.get('/', (ctx, next) => {
    ctx.body = 'GET' + ctx.request.path; 
});

module.exports = api;