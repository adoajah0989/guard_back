import { Sequelize } from "sequelize";
import db from "../config/Database.js";
 
const { DataTypes } = Sequelize;
 
const Guest = db.define('guests',{
    tanggal:{
        type: DataTypes.STRING
    },
    nama:{
        type: DataTypes.STRING
    },
    alamat:{
        type: DataTypes.STRING
    },
    orang_yang_dituju:{
        type: DataTypes.STRING
    },
    keperluan:{
        type: DataTypes.STRING
    },
    no_kendaraan:{
        type: DataTypes.STRING
    },
    no_ktp:{
        type: DataTypes.STRING
    },
    catatan:{
        type: DataTypes.TEXT
    }
},{
    freezeTableName:true
});
 
(async () => {
    await db.sync();
})();
 
export default Guest;