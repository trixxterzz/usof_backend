import { Model, DataTypes } from "sequelize";
import sequelize from "../db.js";

class Category extends Model{}

Category.init(
    {
        title:{
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    },
    {
        sequelize,
        modelName: "category"
    }
)

export default Category;