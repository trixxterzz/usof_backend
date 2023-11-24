import { Model, DataTypes } from "sequelize";
import sequelize from "../db.js";

class Post extends Model{}

Post.init(
    {
        title:{
            type: DataTypes.STRING,
            allowNull: false
        },
        publishDate: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM("Active", "Not active"),
            allowNull: false,
            defaultValue: "Active"
        },
        content: {
            type: DataTypes.TEXT, 
            allowNull: false,
        }
    },
    {
        sequelize,
        modelName: "post"
    }
)

export default Post;