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
        case "createCategory":
            if (!body.title) return {status: false, details: "Missing some creds"};
            return {status: true};
    }
}

router.get("/api/categories", (req, res) => {
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
            try{
                let user = await User.findByPk(data.id);
                if (!user || user?.role != "Admin"){
                    return res.status(403).send({
                        message: "Not allowed"
                    });
                }
                let categories = await Category.findAll();
                return res.status(200).send({
                    categories
                });
            }
            catch (e){
                console.log(e);
                return res.status(403).send({
                    message: "Not allowed"
                });
            }
        }
    });
});

router.get("/api/categories/:id", (req, res) => {
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
            try{
                let user = await User.findByPk(data.id);
                if (!user){
                    return res.status(403).send({
                        message: "Not allowed"
                    });
                }
                let category = await Category.findByPk(req.params.id);
                if (!category){
                    return res.status(404).send({
                        message: "Such category does not exist"
                    });
                }
                return res.status(200).send({
                    category
                });
            }
            catch (e){
                console.log(e);
                return res.status(403).send({
                    message: "Not allowed"
                });
            }
        }
    });
});

router.get("/api/categories/:id/posts", (req, res) => {
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
            try{
                let user = await User.findByPk(data.id);
                if (!user){
                    return res.status(403).send({
                        message: "Not allowed"
                    });
                }
                let category = await Category.findByPk(req.params.id);
                if (!category){
                    return res.status(404).send({
                        message: "Such category does not exist"
                    });
                }
                let posts = await category.getPosts();
                return res.status(200).send({
                    posts
                });
            }
            catch (e){
                console.log(e);
                return res.status(403).send({
                    message: "Not allowed"
                });
            }
        }
    });
});

router.post("/api/categories/", (req, res) => {
    let checked = checkArgs("createCategory", req.body);
    if (!checked.status){
        return res.status(400).send({
            message: checked.details
        })
    }
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
            try{
                let user = await User.findByPk(data.id);
                if (!user || user?.role != "Admin"){
                    return res.status(403).send({
                        message: "Not allowed"
                    });
                }
                let category = await Category.create({
                    title: req.body.title,
                    description: req.body.description ? req.body.description : null
                });
                await category.save();
                return res.status(200).send({
                    message: "Category was created successfully"
                });
            }
            catch(e){
                console.log(e);
                return res.status(403).send({
                    message: "Not allowed"
                });
            }
        }
    });
});

router.patch("/api/categories/:id", (req, res) => {
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
            try{
                let user = await User.findByPk(data.id);
                if (!user || user?.role != "Admin"){
                    return res.status(403).send({
                        message: "Not allowed"
                    });
                }
            
                let category = await Category.findByPk(req.params.id);
                if (!category){
                    return res.status(404).send({
                        message: "Such category does not exist"
                    });
                }
                category.title = req.body.title ? req.body.title : category.title;
                category.description = req.body.description ? req.body.description : category.description;
                await category.save();
                return res.status(200).send({
                    message: "Category successfully updated"
                });
            }
            catch(e){
                console.log(e);
                return res.status(403).send({
                    message: "Not allowed"
                });
            }
        }
    });
});

router.delete("/api/categories/:id", (req, res) => {
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
            try{
                let user = await User.findByPk(data.id);
                if (!user || user?.role != "Admin"){
                    return res.status(403).send({
                        message: "Not allowed"
                    });
                }
                let category = await Category.findByPk(req.params.id);
                if (!category){
                    return res.status(404).send({
                        message: "Such category does not exist"
                    });
                }
                await category.destroy();
                return res.status(200).send({
                    message: "Category successfully deleted"
                });
            }
            catch(e){
                console.log(e);
                return res.status(403).send({
                    message: "Not allowed"
                });
            }
        }
    });
});

export default router;