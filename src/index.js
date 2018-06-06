require('dotenv').config(); // .env 파일에서 환경변수 불러오기
const port = process.env.PORT || 4001; // PORT 값이 설정되어있지 않다면 4001번을 사용합니다.

const Koa = require('koa');
const Router = require('koa-router');
const mongoose = require('mongoose');
const bodyParser = require('koa-bodyparser');
const api = require('./api');
const { jwtMiddleware } = require('./lib/token');

const app = new Koa();
const router = new Router();

mongoose.Promise = global.Promise; // Node의 네이티브 Promise 사용
mongoose.connect(process.env.MONGO_URI)
    .then(response => {
        console.log('Success connected to mongoDB');
    })
    .catch(error => {
        console.log(error);
    });

app
    .use(jwtMiddleware)
    .use(bodyParser()) // bodyParser는 라우터 코드보다 상단에 있어야 합니다.
    .use(router.routes())
    .use(router.allowedMethods());

app.listen(port, () => {
    console.log('Koa server is listening to port: ' + port);
});

router.get('/', (ctx, next) => {
    ctx.body = '루트 페이지 입니다.';
});

router.use('/api', api.routes());