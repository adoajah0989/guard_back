import { Sequelize, DataTypes } from "sequelize";
import db from "../config/Database.js";

const LKM = db.define('lkm', {
  list_lkm: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  urai: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  freezeTableName: true
});

export default LKM;
