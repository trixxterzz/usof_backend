import sequelize from "./db.js";
import authRouter from "./routers/authRouter.js";
import userRouter from "./routers/userRouter.js";
import postRouter from "./routers/postRouter.js";
import categoryRouter from "./routers/categoryRouter.js";
import commentRouter from "./routers/commentRouter.js";
import favouriteRouter from "./routers/favouriteRouter.js";
import express from "express";
import fileUpload from "express-fileupload";
import bodyParser from "body-parser";
import fs from "fs";
import bcrypt from "bcrypt";
import {User} from "./connections.js";
import { exit } from "process";

try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('Connection established');
    let test = await User.findOne({where:{login: "admin"}});
    if (!test){
        await User.create({
            login: "admin",
            password: bcrypt.hashSync("securepass", 12),
            role: "Admin",
            email: "testadminblabla@gmail.com",
            full_name: "Admin Adminovych"
        });
    }
} catch (e) {
    console.log('Cant connect to db due to: ', e);
    exit(1);
}

if (!fs.existsSync("./pictures")){
    fs.mkdirSync("./pictures");
}

const app = express();

app.use(fileUpload());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());
app.use(authRouter);
app.use(userRouter);
app.use(postRouter);
app.use(categoryRouter);
app.use(commentRouter);
app.use(favouriteRouter);

console.log("http://localhost:3000");

app.listen(3000);

