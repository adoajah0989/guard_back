import { Sequelize } from "sequelize";
import db from "../config/Database.js";
 
const { DataTypes } = Sequelize;
 
const PatroliModel = db.define('patroli',{
    tanggal:{
        type: DataTypes.STRING
    },
    lokasi:{
        type: DataTypes.STRING
    },
    urai_temuan:{
        type: DataTypes.TEXT
    },
    url1:{
        type: DataTypes.STRING
    },
    url2:{
        type: DataTypes.STRING
    },
    tindak:{
        type: DataTypes.TEXT
    },
    status:{
        type: DataTypes.STRING
    }
},{
    freezeTableName:true
});
 
(async () => {
    await db.sync();
})();
 
export default PatroliModel;