import { Model, DataTypes } from "sequelize";
import sequelize from "../db.js";

class Comment extends Model{}

Comment.init(
    {
        publishDate: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    },
    {
        sequelize,
        modelName: "comment"
    }
)

export default Comment;