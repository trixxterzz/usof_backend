import { Router } from 'express';
import { User, Post, Category, Comment, Like} from '../connections.js';
import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt";
import path from "path";
import { createTransport } from 'nodemailer';

const router = Router();

function checkArgs(type, body){
    switch(type){
        case "createComment":
            if (!body.content) return {status: false, details: "Missing some creds"};
            return {status: true};
        case "createPost":
            if (!body.title && !body.content && !body.categories) return {status: false, details: "Missing some creds"};
            return {status: true};
        case "createLike":
            if (!body.type) return {status: false, details: "Missing some creds"};
            if (body.type != "Like" && body.type != "Dislike") return {status: false, details: "Wrong type format"};
            return {status: true};
    }
}

function isValidDate(dateString) {
    var regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
    return dateString.match(regex) !== null;
}

function sortPosts(parameter, type, posts){
    switch(parameter){
        case "like":
            if (type == "asc"){
                return posts.sort((a, b) => {
                    return a.likeCount - b.likeCount;
                  });
            }
            if (type == "desc"){
                return posts.sort((a, b) => {
                    return b.likeCount - a.likeCount;
                });
            }
            return {status: false, details: "Unknown sort type"};
        case "publishDate":
            if (type == "asc"){
                return posts.sort((a, b) => {
                    var dateA = new Date(a.publishDate);
                    var dateB = new Date(b.publishDate);
                    return dateA - dateB;
                });
            }
            if (type == "desc"){
                return posts.sort((a, b) => {
                    var dateA = new Date(a.publishDate);
                    var dateB = new Date(b.publishDate);
                    return dateB - dateA;
                });
            }
            return {status: false, details: "Unknown sort type"};
    }
    return {status: false, details: "Unknown sort parameter"};
}

const jwt_secret = "qwerty123asdfgh123zxcvbn";

router.get("/api/posts/", async (req, res) => {
    try {
        let posts;
        for (let i of posts){
            i.dataValues.likeCount = await i.countLikes();
        }
        if (req.body.filterBy == "status") posts = await Post.findAll({where: {status: "Active"}});
        else if (req.body.filterBy == "publishDate" && (!req.body.startDate || !req.body.endDate)){
            res.status(400).send({
                message: "Wrong request parameters"
            });
        }
        else if (req.body.filterBy == "publishDate" && isValidDate(req.body.startDate) && isValidDate(req.body.startDate)){
            buff = await Post.findAll();
            var startDate = new Date(req.body.startDate);
            var endDate = new Date(req.body.startDate);
            posts = buff.filter((post) => {
                var postDate = new Date(post.publishDate);
                return postDate >= startDate && postDate <= endDate;
            });
        }
        let sorted;
        if (req.body.sortType && req.body.sortParameter) sorted = sortPosts(req.body.sortParameter, req.body.sortType, posts);
        else sorted = sortPosts("like", "asc", posts);
        if (!sorted.status){
            res.status(400).send({
                message: "Wrong request parameters"
            });
        }
        return res.status(200).send({
            posts: sorted
        });
    }
    catch(e){
        console.log(e);
        res.status(403).send({
        });
    }
});

router.get("/api/posts/:id", async (req, res) => {
    try {
        let post = await Post.findByPk(req.params.id);
        if (!post){
            return res.status(404).send({
                message: "Such post does not exist"
            });
        }
        return res.status(200).send({
            post
        });
    }
    catch(e){
        console.log(e);
        res.status(403).send({
        });
    }
});

router.get("/api/posts/:id/comments", async (req, res) => {
    try {
        let post = await Post.findByPk(req.params.id);
        if (!post){
            return res.status(404).send({
                message: "Such post does not exist"
            });
        }
        let comments = await post.getComments()
        return res.status(200).send({
            comments
        });
    }
    catch(e){
        console.log(e);
        res.status(403).send({
        });
    }
});

router.post("/api/posts/:id/comments", async (req, res) => {
    let checked = checkArgs("createComment", req.body);
    if (!checked.status){
        return res.status(400).send({
            message: checked.details
        });
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
        try{
            if (data){
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
                let comment = await Comment.create({content: req.body.content});
                await comment.setUser(user);
                await comment.setPost(post);
                await comment.save()
                return res.status(200).send({
                    message: "Comment was created successfully"
                })
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

router.get("/api/posts/:id/categories", (req, res) => {
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
                let post = await Post.findByPk(req.params.id);
                if (!post){
                    return res.status(404).send({
                        message: "Such post does not exist"
                    });
                }
                let comments = await post.getCategories();
                return res.status(200).send({
                    comments
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

router.get("/api/posts/:id/likes", (req, res) => {
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
                let post = await Post.findByPk(req.params.id);
                if (!post){
                    return res.status(404).send({
                        message: "Such post does not exist"
                    });
                }
                let likes = await post.getLikes();
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

router.post("/api/posts/", async (req, res) => {
    let checked = checkArgs("createPost", req.body);
    if (!checked.status){
        return res.status(400).send({
            message: checked.details
        });
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
        try{
            if (data){
                let user = await User.findByPk(data.id);
                if (!user){
                    return res.status(403).send({
                        message: "Not allowed"
                    });
                }
                let post = await Post.create({
                    title: req.body.title,
                    content: req.body.content
                });
                for (let i of req.body.categories){
                    let category = await Category.findOne({where: {title: i}});
                    if (!category){
                        return res.status(400).send({
                            message: "Invalid category name"
                        });
                    }
                    await post.addCategory(category);
                    await post.save();
                }
                await post.setUser(user);
                await post.save();
                return res.status(200).send({
                    message: "Post was created successfully"
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

router.post("/api/posts/:id/likes", (req, res) => {
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
                let test = await Like.findOne({where: {likedPostId: req.params.id, authorId: data.id}});
                if (test){
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
                let like = await Like.create({
                    likedPostId: req.params.id,
                    type: req.body.type
                })
                await like.setUser(user);
                await like.setPost();
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

router.patch("/api/posts/:id", (req, res) => {
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
                let post = await Post.findByPk(req.params.id);
                if (post.authorId != user.id && user.role != "Admin"){
                    return res.status(403).send({
                        message: "Not allowed"
                    });
                }
                if (req.body.title){
                    post.title = req.body.title;
                }
                if (req.body.content){
                    post.content = req.body.content;
                }
                if (req.body.categories){
                    await post.setCategories();
                    for (let i of req.body.categories){
                        let category = await Category.findOne({where: {title: i}});
                        if (!category){
                            return res.status(400).send({
                                message: "Invalid category name"
                            });
                        }
                        await post.addCategory(category);
                        await post.save();
                    }
                }
                await post.save();
                return res.status(200).send({
                    message: "Post was updated successfully"
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

router.delete("/api/posts/:id", async (req, res) => {
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
                let post = await Post.findByPk(req.params.id);
                if (!post){
                    return res.status(404).send({
                        message: "Such post does not exist"
                    });
                }
                if (post.authorId != user.id && user.role != "Admin"){
                    return res.status(403).send({
                        message: "Not allowed"
                    });
                }
                await post.destroy();
                return res.status(200).send({
                    message: "Post was deleted successfully"
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

router.delete("/api/posts/:id/likes", async (req, res) => {
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
                let post = await Post.findByPk(req.params.id);
                if (!post){
                    return res.status(404).send({
                        message: "Such post does not exist"
                    });
                }
                let like = await Like.findOne({where: {likedPostId: req.params.id, authorId: data.id}});
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