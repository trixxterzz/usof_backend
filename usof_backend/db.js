import { Sequelize } from "sequelize";
import cfg from "./dbCfg.json" assert {type: "json"}

const sequelize = new Sequelize(cfg);


export default sequelize;