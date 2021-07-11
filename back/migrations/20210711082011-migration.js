'use strict';

/**
 * opened 컬럼 추가, 기본값 true로 세팅.
 * @type {{up: module.exports.up, down: module.exports.down}}
 */
module.exports = {
  up: async (queryInterface, DataTypes) => {
    queryInterface.addColumn('Stores', 'opened', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    })
  },

  down: async (queryInterface, DataTypes) => {
    queryInterface.removeColumn('Users', 'opened');
  }
};
