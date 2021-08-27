const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const path = require('path');
console.log(process.env.NODE_ENV);
dotenv.config({
  path: path.resolve(
    process.env.NODE_ENV == "production" ? ".env.prod" : ".env.dev"
  ),
}); /** ./models 보다 위에 있어야 process.env로 .env가 매칭됨 **/
const db = require('./models');
const userAPIRouter = require('./routes/user');
const storesAPIRouter = require('./routes/stores');

const app = express();
db.sequelize.sync(); // 테이블을 알아서 생성해 줌

// 요청이 들어왔을때 요청을 찍어주는 기능을 할 수 있게된다.
app.use(morgan('dev'));
// static middleware
app.use('/', express.static('uploads'));
// 아래 두줄이 있을때 req.body를 사용할 수 있게 된다.
app.use(express.json()); // JSON 형식의 본문을 처리한다.
app.use(express.urlencoded({ extended: true })); // Form으로 넘어온 데이터를 처리한다.
app.use(cors({
  origin: true,
  credentials: true,
})); // cors 문제 처리
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use('/api/user', userAPIRouter);
app.use('/api/stores', storesAPIRouter);
// 로컬 호스트의 서버 실행
app.listen(3000, () => {
  console.log('server is running on localhost: 3000');
});

app.get('/', (req, res) => {
  res.send('lotto backend 서버 정상 동작!');
});
