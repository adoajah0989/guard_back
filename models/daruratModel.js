import { Sequelize, DataTypes } from "sequelize";
import db from "../config/Database.js";

const Darurat = db.define('darurat', {
  lokasi: {
    type: DataTypes.STRING,
    allowNull:false,
  },
  nomor:{
    type: DataTypes.STRING,
    allowNull:false,
  },
  type:{
    type: DataTypes.STRING,
    allowNull:false,
  }
}, {
  freezeTableName: true
});

 
(async () => {
    await db.sync();
})();

export default Darurat;
