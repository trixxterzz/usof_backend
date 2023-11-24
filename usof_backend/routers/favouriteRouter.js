import { Router } from 'express';
import { User, Post, Category, Comment, Like, Favourite} from '../connections.js';
import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt";
import path from "path";
import { createTransport } from 'nodemailer';

const router = Router();

const jwt_secret = "qwerty123asdfgh123zxcvbn";


router.get("/api/favourites/", async (req, res) => {
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
                let allFavourites = await Favourite.findAll();
                let favouritesId = [];
                for (let i of allFavourites) if (i.userId == user.id) favouritesId.push(i.postId);
                let favourites = [];
                for (let i of favourites) favourites.push(await Favourite.findByPk(i));
                return res.status(200).send({
                    favourites
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

router.post("/api/favourites/:id", async (req, res) => {
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
                let post = await Post.findByPk(req.params.id);
                if (!post){
                    return res.status(404).send({
                        message: "Such post does not exist"
                    });
                }
                let favourite = await Favourite.create({
                    userId: user.id,
                    postId: post.id
                });
                return res.status(200).send({
                    message: "Post has been added successfully"
                });
            }
            catch(e){
                console.log(e);
                res.status(403).send({
                    message: "Something went wrong"
                });
            }
            
        }
    });
});

router.delete("/api/favourites/:id", (req, res) => {
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
                let post = await Post.findByPk(req.params.id);
                if (!post){
                    return res.status(404).send({
                        message: "Such post does not exist"
                    });
                }
                let favourite = await Favourite.findOne({where: {userId: user.id, postId: post.id}});
                if (!favourite){
                    return res.status(404).send({
                        message: "Such post is not on favourites list"
                    });
                }
                await favourite.destroy();
                return res.status(200).send({
                    message: "Post has been deleted from list successfully"
                });
            }
            catch(e){
                console.log(e);
                res.status(403).send({
                    message: "Something went wrong"
                });
            }
            
        }
    });
});

export default router;