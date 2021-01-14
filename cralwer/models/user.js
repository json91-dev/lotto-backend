module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    uniqueid: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true, // 고유한 값
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  }, {
    charset: 'utf8',
    collate: 'utf8_general_ci', // utf-8 설정 : 한글이 저장됨.
    // tableName: 'users', => 햇깔리면 달아두기
  });

  User.associate = (db) => {
    db.User.belongsToMany(db.Store, { through: 'Like', as: 'Liked' }); // 다대다 테이블
  };

  return User;
};
