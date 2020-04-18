'use strict';
const models = require('../models');
const argon2 = require('argon2');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const availabilities = await models.Availability.findAll();
    const requirements = await models.Requirement.findAll();
    const manufacturings = await models.Manufacturing.findAll();

    for (const app of [availabilities, requirements, manufacturings]) {
      for (const item of app) {
        try {
          const [user, created] = await models.User.findOrCreate({
            where: { email: item.email },
            defaults: {
              username: item.name,
              role: 'Applicant',
              contact: item.contact,
              password: await argon2.hash(item.name),
              createdAt: new Date(),
              updatedAt: new Date()
            }
          });

          await item.update({ UserId: user.id });
        }
        catch (e) {
          console.log(e);
        }
      }
    }
    return queryInterface.bulkInsert('Users', [{
      username: 'Seeding done',
      role: 'Applicant',
      email: 'done@seeding.com',
      contact: '987654321',
      password: await argon2.hash('987654321'),
      createdAt: new Date(),
      updatedAt: new Date()
    }]);

  },

  down: async (queryInterface, Sequelize) => {
    const availabilities = await models.Availability.findAll();
    const requirements = await models.Requirement.findAll();
    const manufacturings = await models.Manufacturing.findAll();

    for (const app of [availabilities, requirements, manufacturings]) {
      for (const item of app) {
        try {
          if (!item.UserId) {
            continue;
          }
          const user = await models.User.findOne({ where: { id: item.UserId } });
          if(!user){
            continue;
          }
          await user.destroy();
          await item.update({ UserId: null });
        }
        catch (e) {
          console.log(e);
        }

      }
    }
    return queryInterface.bulkDelete('Users', {
      'email': 'done@seeding.com'
    });
  }
};
