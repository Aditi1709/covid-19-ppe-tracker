'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      'Users',
      'contact',
      {
        type:Sequelize.STRING
      }
    );
    await queryInterface.addColumn(
      'Availabilities',
      'UserId',
      {
        type: Sequelize.INTEGER,
        onDelete: "SET NULL",
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        }
      }
    );
    await queryInterface.addColumn(
      'Requirements',
      'UserId',
      {
        type: Sequelize.INTEGER,
        onDelete: "SET NULL",
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        }
      }
    );
    return queryInterface.addColumn(
      'Manufacturings',
      'UserId',
      {
        type: Sequelize.INTEGER,
        onDelete: "SET NULL",
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        }
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(
      'Manufacturings',
      'UserId'
    );
    await queryInterface.removeColumn(
      'Requirements',
      'UserId'
    );
    await queryInterface.removeColumn(
      'Availabilities',
      'UserId'
    );
    return queryInterface.removeColumn(
      'Users',
      'contact'
    );
  }
};
