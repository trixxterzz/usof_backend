import { Router } from 'express';
import { User, Post, Category, Comment, Like} from '../connections.js';
import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt";
import path from "path";
import { createTransport } from 'nodemailer';

const router = Router();

const jwt_secret = "qwerty123asdfgh123zxcvbn";

function checkArgs(type, body){
    switch(type){
        case "createUser":
            if (!body.login || !body.password || !body.passwordConfirm || !body.email || !body.name || !body.role) return {status: false, details: "Missing some creds"};
            if (body.role != "User" && body.role != "Admin") return {status: false, details: "Wrong role!"};
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) return {status: false, details: "Email has wrong format"};
            if (body.login.trim().length > 21 || body.password.trim().length > 31) return {status: false, details: "Login or password are too long"};
            if (body.password.trim() != body.passwordConfirm.trim()) return {status: false, details: "Passwords doesn't match"};
            if (/\s/.test(body.login.trim()) || /\s/.test(body.password.trim())) return {status: false, details: "Password and login must not contain spaces"};
            return {status: true};
    }
}

router.get("/api/users", async (req, res) => {
    if (!req.headers.authorization){
        return res.status(403).send({
            message: "Not allowed"
        });
    }
    let token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, jwt_secret, async (error, data) => {
        if (error){
            return res.status(403).send({
                message: "Not allowed"
            });
        }
        if (data){
            try {
                let user = await User.findByPk(data.id);
                if (!user){
                    return res.status(403).send({
                        message: "Not allowed"
                    });
                }
                let users = await User.findAll();
                return res.status(200).send({
                    users
                });
            }
            catch(e){
                console.log(e);
                res.status(403).send({
                });
            }
            
        }
    });
});

router.get("/api/users/:id", async (req, res) => {
    if (!req.headers.authorization){
        return res.status(403).send({
            message: "Not allowed"
        });
    }
    let token = req.headers.authorization.split(" ")[1];
    let targetId = req.params.id;
    jwt.verify(token, jwt_secret, async (error, data) => {
        if (error){
            return res.status(403).send({
                message: "Not allowed"
            });
        }
        if (data){
            try {
                let user = await User.findByPk(data.id);
                if (!user){
                    return res.status(403).send({
                        message: "Not allowed"
                    });
                }
                let targetUser = await User.findByPk(targetId);
                if (!targetUser){
                    return res.status(404).send({
                        message: "Such user does not exist"
                    })
                }
                return res.status(200).send({
                    user: targetUser
                });
            }
            catch(e){
                console.log(e);
                res.status(403).send({
                });
            }
            
        }
    });
});

router.post("/api/users", async (req, res) => {
    if (!req.headers.authorization){
        return res.status(403).send({
            message: "Not allowed"
        });
    }
    let token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, jwt_secret, async (error, data) => {
        if (error){
            return res.status(403).send({
                message: "Not allowed"
            });
        }
        if (data){
            try {
                let admin = await User.findByPk(data.id);
                if (!admin || admin.role != "Admin"){
                    return res.status(403).send({
                        message: "Not allowed"
                    });
                }
                let checked = checkArgs("createUser", req.body);
                if (!checked.status){
                    return res.status(403).send({
                        message: checked.details
                    })
                }
                let user = await User.create({
                    login: req.body.login.trim(),
                    password: bcrypt.hashSync(req.body.password.trim(), 12),
                    email: req.body.email.trim(),
                    full_name: req.body.name.trim(),
                    role: req.body.role
                });
                return res.status(200).send({
                    user
                });
            }
            catch(e){
                console.log(e);
                res.status(403).send({
                });
            }
            
        }
    });
});

router.patch("/api/users/avatar", (req, res) => {
    if (!req.headers.authorization){
        return res.status(403).send({
            message: "Not allowed"
        });
    }
    let token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, jwt_secret, async (error, data) => {
        if (error){
            return res.status(403).send({
                message: "Not allowed"
            });
        }
        if (data){
            try {
                let user = await User.findByPk(data.id);
                if (!user){
                    return res.status(403).send({
                        message: "Not allowed"
                    });
                }
                if (!req.files?.profile_picture){
                    return res.status(400).send({
                        message: "No picture have been sent!"
                    });
                }
                req.files.profile_picture.mv(path.join("./pictures", `${user.login}.png`));
                user.profile_picture = user.login;
                await user.save()
                return res.status(200).send({
                    message: "Success!"
                });
            }
            catch(e){
                console.log(e);
                res.status(403).send({
                });
            }
            
        }
    });
});

router.patch("/api/users/:id", (req, res) => {
    if (!req.headers.authorization){
        return res.status(403).send({
            message: "Not allowed"
        });
    }
    let token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, jwt_secret, async (error, data) => {
        if (error){
            return res.status(403).send({
                message: "Not allowed"
            });
        }
        if (data){
            try {
                let admin = await User.findByPk(data.id);
                if (!admin || (admin.role != "Admin" && admin.id != req.params.id)){
                    return res.status(403).send({
                        message: "Not allowed"
                    });
                }
                let user = await User.findByPk(req.params.id);
                if (req.body.login){
                    user.login = req.body.login.trim();
                }
                if (req.body.email){
                    user.email = req.body.email.trim();
                }
                if (req.body.name){
                    user.full_name = req.body.name.trim();
                }
                await user.save()
                return res.status(200).send({
                    message: "Success"
                });
            }
            catch(e){
                console.log(e);
                res.status(403).send({
                });
            }
            
        }
    });
});

router.delete("/api/users/:id", (req, res) => {
    if (!req.headers.authorization){
        return res.status(403).send({
            message: "Not allowed"
        });
    }
    let token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, jwt_secret, async (error, data) => {
        if (error){
            return res.status(403).send({
                message: "Not allowed"
            });
        }
        if (data){
            try {
                let admin = await User.findByPk(data.id);
                if (!admin || (admin.role != "Admin" && admin.id != req.params.id)){
                    return res.status(403).send({
                        message: "Not allowed"
                    });
                }
                let user = await User.findByPk(req.params.id);
                user.destroy();
                await user.save()
                return res.status(200).send({
                    message: "Success"
                });
            }
            catch(e){
                console.log(e);
                res.status(403).send({
                });
            }
            
        }
    });
});

export default router;