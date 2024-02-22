import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const InOut = db.define('inout', {
  image: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  no_kendaraan: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  time_in: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  time_out: {
    type: DataTypes.STRING
  },
}, {
    freezeTableName:true
});
 
(async () => {
    await db.sync();
})();

export default InOut;
