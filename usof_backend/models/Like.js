import { Model, DataTypes } from "sequelize";
import sequelize from "../db.js";

class Like extends Model{}

Like.init(
    {
        publishDate: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false
        },
        likedPostId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        likedCommentId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        type: {
            type: DataTypes.ENUM("Like", "Dislike"),
            allowNull: false
        }
    },
    {
        sequelize,
        modelName: "like"
    }
)

export default Like;