const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.js')[env];
const db = {};

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config);

db.Store = require('./store')(sequelize, Sequelize);
db.User = require('./user')(sequelize, Sequelize);
db.Winning = require('./winning')(sequelize, Sequelize);

// DB의 테이블을 먼저 지정해놓아야 associate 함수를 사용할수 있기 때문에,
// 해당 아래 코드가 항상 위에 테이블선언 밑으로 와야 한다.
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
