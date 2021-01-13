module.exports = (sequelize, DataTypes) => {
  const Store = sequelize.define('Store', {
    src: {
      address: DataTypes.STRING(200),
      name: DataTypes.STRING(30),
      resion1: DataTypes.STRING(20),
      resion2: DataTypes.STRING(20),
      resion3: DataTypes.STRING(20),
      storetype: DataTypes.TINYINT,
      latitude: DataTypes.DOUBLE(5, 20),
      longitude: DataTypes.DOUBLE(5, 20),
      donghangid: DataTypes.INTEGER,
    },
  }, {
    charset: 'utf8',
    collate: 'utf8_general_ci',
  });

  Store.associate = (db) => {
    db.Store.belongsToMany(db.User, { through: 'Like', as: 'Liker' }); // 다대다 테이블
  };

  return Image;
};
