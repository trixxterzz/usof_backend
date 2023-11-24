import { Router } from 'express';
import { User, Post, Category, Comment, Like} from '../connections.js';
import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt";
import path from "path";
import { createTransport } from 'nodemailer';

const router = Router();
const jwt_secret = "qwerty123asdfgh123zxcvbn";

router.get("/api/comments/:id", (req, res) => {
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
                let comment = await Comment.findByPk(req.params.id);
                if (!comment){
                    return res.status(404).send({
                        message: "Such comment does not exist"
                    });
                }
                return res.status(200).send({
                    comment
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

router.get("/api/comments/:id/likes", (req, res) => {
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
                let comment = await Comment.findByPk(req.params.id);
                if (!comment){
                    return res.status(404).send({
                        message: "Such comment does not exist"
                    });
                }
                let likes = await comment.getLikes();
                return res.status(200).send({
                    likes
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

router.post("/api/comments/:id/likes", (req, res) => {
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
        try{
            if (data){
                let user = await User.findByPk(data.id);
                if (!user){
                    return res.status(403).send({
                        message: "Not allowed"
                    });
                }
                let test = await Like.findOne({where: {likedCommentId: req.params.id, authorId: data.id}});
                if (test){
                    return res.status(403).send({
                        message: "Not allowed"
                    });
                }
                let like = await Like.create({
                    likedCommentId: req.params.id,
                    type: req.body.type
                })
                await like.setUser(user);
                let comment = await Comment.findByPk(req.params.id);
                if (!comment){
                    return res.status(404).send({
                        message: "Such comment does not exist"
                    });
                }
                await like.setComment();
                return res.status(200).send({
                    message: "Liked was created successfully"
                });
            }
        }
        catch(e){
            console.log(e);
            return res.status(403).send({
                message: "Not allowed"
            });
        }
    });
});

router.patch("/api/comments/:id", (req, res) => {
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
        try{
            if (data){
                let user = await User.findByPk(data.id);
                if (!user){
                    return res.status(403).send({
                        message: "Not allowed"
                    });
                }
                let comment = await Comment.findByPk(req.params.id);
                if (comment.authorId != user.id && user.role != "Admin"){
                    return res.status(403).send({
                        message: "Not allowed"
                    });
                }
                if (req.body.content){
                    comment.content = req.body.content;
                }
                if (req.body.publishDate){
                    comment.publishDate = req.body.publishDate;
                }
                await comment.save();
                return res.status(200).send({
                    message: "Comment was updated successfully"
                });
            }
        }
        catch(e){
            console.log(e);
            return res.status(403).send({
                message: "Not allowed"
            });
        }
    });
});

router.delete("/api/comments/:id", async (req, res) => {
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
        try{
            if (data){
                let user = await User.findByPk(data.id);
                if (!user){
                    return res.status(403).send({
                        message: "Not allowed"
                    });
                }
                let comment = await Comment.findByPk(req.params.id);
                if (!comment){
                    return res.status(404).send({
                        message: "Such comment does not exist"
                    });
                }
                if (comment.authorId != user.id && user.role != "Admin"){
                    return res.status(403).send({
                        message: "Not allowed"
                    });
                }
                await comment.destroy();
                return res.status(200).send({
                    message: "Comment was deleted successfully"
                });
            }
        }
        catch(e){
            console.log(e);
            return res.status(403).send({
                message: "Not allowed"
            });
        }
    });
});

router.delete("/api/comments/:id/likes", async (req, res) => {
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
        try{
            if (data){
                let user = await User.findByPk(data.id);
                if (!user){
                    return res.status(403).send({
                        message: "Not allowed"
                    });
                }
                let comment = await Comment.findByPk(req.params.id);
                if (!comment){
                    return res.status(404).send({
                        message: "Such comment does not exist"
                    });
                }
                let like = await Like.findOne({where: {likedCommentId: req.params.id, authorId: data.id}});
                if (!like){
                    return res.status(404).send({
                        message: "Such like does not exist"
                    });
                }
                await like.destroy();
                return res.status(200).send({
                    message: "Like was deleted successfully"
                });
            }
        }
        catch(e){
            console.log(e);
            return res.status(403).send({
                message: "Not allowed"
            });
        }
    });
});

export default router;