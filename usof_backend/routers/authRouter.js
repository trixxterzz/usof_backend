import { Router } from 'express';
import { User, Post, Category, Comment, Like} from '../connections.js';
import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt";
import path from "path";
import { createTransport } from 'nodemailer';

const router = Router();

const jwt_secret = "qwerty123asdfgh123zxcvbn";

const transport = createTransport({
    service: "gmail",
    auth: {
        user: "jpryshcheporg@gmail.com",
        pass: "fvhdgbkpknqgsqqb"
    }
})


function checkArgs(type, body){
    switch(type){
        case "register":
            if (!body.login || !body.password || !body.passwordConfirm || !body.email || !body.name) return {status: false, details: "Missing some creds"};
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) return {status: false, details: "Email has wrong format"};
            if (body.login.trim().length > 21 || body.password.trim().length > 31) return {status: false, details: "Login or password are too long"};
            if (body.password.trim() != body.passwordConfirm.trim()) return {status: false, details: "Passwords doesn't match"};
            if (/\s/.test(body.login.trim()) || /\s/.test(body.password.trim())) return {status: false, details: "Password and login must not contain spaces"};
            return {status: true};
        case "login":
            if (!body.login || !body.password || !body.email) return {status: false, details: "Missing some creds"};
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) return {status: false, details: "Email has wrong format"};
            return {status: true};  
        case "passReset":
            if (body.email == null) return {status: false, details: "Missing some creds"};
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) return {status: false, details: "Email has wrong format"};
            return {status: true};
        case "passReset2":
            if (!body.new_password) return {status: false, details: "Missing some creds"};
            if (body.new_password.length > 31) return {status: false, details: "Login or password are too long"};
            return {status: true};
    }
}

router.post("/api/auth/register", async (req, res) => {
    let checked = checkArgs("register", req.body);
    if (!checked.status) {
        console.log(checked.details);
        return res.status(400).send({
            message: checked.details
        });
    } 
    let user;
    try {
        user = await User.create({
            login: req.body.login.trim(),
            password: bcrypt.hashSync(req.body.password.trim(), 12),
            email: req.body.email.trim(),
            full_name: req.body.name.trim(),
            role: "User"
        });
        if (req.files?.profile_picture) {
            req.files.profile_picture.mv(path.join("../pics", req.body.login));
            user.profile_picture = req.body.login;
            await user.save();
        }
        var token = jwt.sign({id: user.id}, jwt_secret, {expiresIn: "1d"});
        res.status(200).send({
            token,
            data: {
                user
            }
        });
    }
    catch (e){
        console.log(e);
        res.sendStatus(403);
    }
});

router.post("/api/auth/login", async (req, res) => {
    let checked = checkArgs("login", req.body);
    if (!checked.status){
        return res.status(400).send({
            message: checked.details
        });
    }
    let user;
    try {
        user = await User.findOne({where: {login: req.body.login}});
        if (!user || !bcrypt.compareSync(req.body.password, user.password) || req.body.email != user.email){
            return res.status(403).send({
                message: "Wrong login, password or email"
            });
        }
        var token = jwt.sign({id: user.id}, jwt_secret, {expiresIn: "1d"});
        res.status(200).send({
            token,
            data: {
                user
            }
        });
    }
    catch(e){
        console.log(e);
        res.sendStatus(403);
    }
});

router.post("/api/auth/logout", (req, res) => {
    jwt.verify(req.headers.authorization.split(" ")[1], jwt_secret, (error, data) => {
        if (data){
            let user = User.findByPk(data.id)
            if (!user){
                return res.send(403).send({
                    message: "Not allowed"
                });
            }
            var token = jwt.sign({id: user.id}, jwt_secret, {expiresIn: "1"});
            res.status(200).send({
                token
            });
        }
        if (error){
            return res.send(403).send({
                message: "Not allowed"
            });
        }

    });
});

router.post("/api/auth/password-reset", async (req, res) => {
    let checked = checkArgs("passReset", req.body);
    console.log(checked);
    if (!checked.status){
        return res.status(400).send({
            message: checked.details
        })
    }
    let user;
    try {
        user = await User.findOne({where: {email: req.body.email}});
        if (!user){
            console.log(e);
            return res.status(403).send({
                message: "No user with such email!"
            });
        }
        await transport.sendMail({
            from: "Usof System",
            to: user.email,
            subject: "Usof Password Reset",
            html: 
            `
            <h1>Link to reset your password</h1>
            <a href="${req.protocol + `://` + req.get("host") + `/api/auth/password-reset/` + jwt.sign({email: user.email}, jwt_secret, {expiresIn: "10m"})}"><button>LINK</button></a>
            `
        }, (error, info) => {
            if (error){
                res.status(403).send({
                    message: "Something went wrong!"
                })
            }
            if (info){
                res.status(200).send({
                    message: "Email has been sent!"
                });
            }
        });

    }
    catch(e){
        console.log(e);
        res.status(403).send({
        });
    }
});

router.post("/api/auth/password-reset/:token", async (req, res) => {
    let checked = checkArgs("passReset2", req.body);
    if (!checked.status){
        return res.status(400).send({
            message: checked.details
        });
    }
    let token = req.params.token;
    jwt.verify(token, jwt_secret, async (error, data) => {
        if (data){
            try {
                let user = await User.findOne({where: {email: data.email}});
                if (!user){
                    return res.status(403).send({
                        message: "Not allowed 1"
                    });
                }
                user.password = bcrypt.hashSync(req.body.new_password.trim(), 12);
                await user.save();
                return res.status(200).send({
                    message: "Password has been updated"
                });
            }
            catch (e){
                console.log(e);
                res.status(403).send({
                });
            }
        }
        if (error){
            return res.status(403).send({
                message: "Not allowed 2"
            });
        }
    });
});

export default router;