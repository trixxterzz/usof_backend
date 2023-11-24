import { Model, DataTypes } from "sequelize";
import sequelize from "../db.js";

class User extends Model{}

User.init({
    login: {
        type: DataTypes.STRING(21),
        unique: true,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    full_name: {
        type: DataTypes.STRING(590),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true
        },
        unique: true
    },
    profile_picture: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    role: {
        type: DataTypes.ENUM("User", "Admin"),
        defaultValue: "User",
        allowNull: false
    }
}, {
    sequelize,
    modelName: "user"
}    
);

export default User;
