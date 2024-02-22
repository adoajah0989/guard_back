import { Sequelize, DataTypes } from "sequelize";
import db from "../config/Database.js";

const Barcode = db.define('barcode', {
  lokasi: {
    type: DataTypes.STRING
  },
  timestamp: {
    type: DataTypes.STRING
  },
}, {
  freezeTableName: true
});

export default Barcode;
