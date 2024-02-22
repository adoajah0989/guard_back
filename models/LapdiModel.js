import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const Lapdi = db.define('lapdi_anggota', {
  tanggal: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  jam: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  anggota: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  urai: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  lokasi: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  penyebab: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  kerugian: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tindakan: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
    freezeTableName:true
});
 
(async () => {
    await db.sync();
})();

export default Lapdi;
