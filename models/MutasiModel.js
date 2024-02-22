import { Sequelize } from "sequelize";
import db from "../config/Database.js";
 
const { DataTypes } = Sequelize;
 
const Mutasi = db.define('mutasi',{
    tanggal:{
        type: DataTypes.STRING
    },
    shift:{
        type: DataTypes.STRING
    },
    anggota_1:{
        type: DataTypes.STRING
    },
    anggota_2:{
        type: DataTypes.STRING
    },
    anggota_3:{
        type: DataTypes.STRING
    },
    kegiatan_1:{
        type: DataTypes.TEXT
    },
    kegiatan_2:{
        type: DataTypes.TEXT
    },
    danru_a:{
        type: DataTypes.STRING
    },
    danru_b:{
        type: DataTypes.STRING
    }
},{
    freezeTableName:true
});
 
(async () => {
    await db.sync();
})();
 
export default Mutasi;