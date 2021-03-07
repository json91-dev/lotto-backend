'use strict';

module.exports = {
  up: async (queryInterface, DataTypes) => {
    queryInterface.addColumn('Users', 'address', {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    });

    // queryInterface.renameColumn('Users','uniqueid', 'deviceid', {
    //   allowNull: true,
    // });
    // queryInterface.removeColumn('Users', 'password');
  },

  down: async (queryInterface, DataTypes) => {
    queryInterface.removeColumn('Users', 'address');
  }
};
