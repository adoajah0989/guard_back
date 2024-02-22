import { Sequelize, DataTypes } from "sequelize";
import db from "../config/Database.js";

const BAP = db.define('bap', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  tanggal: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  jam: {
    type: DataTypes.STRING
  },
  pemeriksa: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  diperiksa: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ttl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  pekerjaan: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  alamat: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ktp: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  hp: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  pertanyaan1: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  pertanyaan2: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  pertanyaan3: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  pertanyaan4: {
    type: DataTypes.STRING
  },
  pertanyaan5: {
    type: DataTypes.STRING
  },
  jawaban1: {
    type: DataTypes.STRING
  },
  jawaban2: {
    type: DataTypes.STRING
  },
  jawaban3: {
    type: DataTypes.STRING
  },
  jawaban4: {
    type: DataTypes.STRING
  },
  jawaban5: {
    type: DataTypes.STRING
  }
}, {
  freezeTableName: true
});

(async () => {
  await db.sync();
})();

export default BAP;
