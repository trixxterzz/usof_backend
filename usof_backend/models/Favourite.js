import { Model, DataTypes } from "sequelize";
import sequelize from "../db.js";

class Favourite extends Model{}

Favourite.init(
    {
        userId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        postId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
    },
    {
        sequelize,
        modelName: "favourite"
    }
)

export default Favourite;