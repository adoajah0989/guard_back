import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const Darurat = db.define(
  "darurat2",
  {
    lokasi: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nomor: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type:{
      type: DataTypes.STRING,
      allowNull: false,
    }
  },
  {
    freezeTableName: true,
  }
);

export default Darurat;

(async () => {
  await db.sync();
})();
