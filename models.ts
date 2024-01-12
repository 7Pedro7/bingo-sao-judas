import { Sequelize, DataTypes } from 'sequelize';
import { db } from './db'

export const BingoModel = db.define('Bingo', {
  // Model attributes are defined here
  number: {
    type: DataTypes.NUMBER,
    allowNull: false,
    primaryKey: true
  },
}, {
  // Other model options go here
});
