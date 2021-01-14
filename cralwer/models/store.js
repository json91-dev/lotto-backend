module.exports = (sequelize, DataTypes) => {
  const Store = sequelize.define('Store', {
    address: {
      type: DataTypes.STRING(200)
    },
    name: {
      type: DataTypes.STRING(30),
    },
    phone: {
      type: DataTypes.STRING(20),
    },
    region1: {
      type: DataTypes.STRING(20),
    },
    region2: {
      type: DataTypes.STRING(20),
    },
    region3: {
      type: DataTypes.STRING(20),
    },
    storetype: {
      type: DataTypes.INTEGER,
    },
    latitude: {
      type: DataTypes.DOUBLE,
    },
    longitude: {
      type: DataTypes.DOUBLE,
    },
    donghangid: {
      type: DataTypes.STRING(10),
    },
  }, {
    charset: 'utf8',
    collate: 'utf8_general_ci',
  });

  Store.associate = (db) => {
    db.Store.belongsToMany(db.User, { through: 'Like', as: 'Liker' }); // 다대다 테이블
  };

  return Store;
};
