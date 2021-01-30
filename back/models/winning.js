module.exports = (sequelize, DataTypes) => {
  const Winning = sequelize.define('Winning', {
    rank: {
      type: DataTypes.INTEGER,
    },
    round: {
      type: DataTypes.INTEGER,
    },
    selection: {
      type: DataTypes.STRING(10),
    },
  }, {
    charset: 'utf8',
    collate: 'utf8_general_ci',
  });

  Winning.associate = (db) => {
    db.Winning.belongsTo(db.Store);
  };

  return Winning;
};
