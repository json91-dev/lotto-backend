'use strict';

module.exports = {
  up: async (queryInterface, DataTypes) => {
    queryInterface.renameColumn('Users','uniqueid', 'deviceid', {
      allowNull: true,
    });

    queryInterface.addColumn('Users', 'nickname', {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
    });

    queryInterface.addColumn('Users', 'provider', {
      type: DataTypes.STRING(20),
      allowNull: false,
    });

    queryInterface.addColumn('Users', 'snsid', {
      type: DataTypes.STRING(40),
      unique: true,
    });

    queryInterface.removeColumn('Users', 'password');
  },
  down: async (queryInterface, DataTypes) => {

  }
};
