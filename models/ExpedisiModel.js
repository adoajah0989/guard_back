import { Sequelize } from "sequelize";
import db from "../config/Database.js";
 
const { DataTypes } = Sequelize;
 
const ExpedisiModel = db.define('expedisi',{
    tanggal:{
        type: DataTypes.STRING
    },
    namaDok:{
        type: DataTypes.STRING
    },
    dari:{
        type: DataTypes.TEXT
    },
    url1:{
        type: DataTypes.STRING
    },
    untuk:{
        type: DataTypes.TEXT
    },
    diserahkan:{
        type: DataTypes.STRING
    }
},{
    freezeTableName:true
});
 
(async () => {
    await db.sync();
})();
 
export default ExpedisiModel;