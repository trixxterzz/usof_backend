import User from "./models/User.js"
import Post from "./models/Post.js"
import Category from "./models/Category.js"
import Like from "./models/Like.js"
import Comment from "./models/Comment.js"
import Favourite from "./models/Favourite.js"

User.hasMany(Post, {
    foreignKey: "authorId"
});
Post.belongsTo(User, {
    foreignKey: "authorId"
});

Post.belongsToMany(Category, {
    through: "post_category"
});
Category.belongsToMany(Post, {
    through: "post_category"
})

Post.hasMany(Comment);
Comment.belongsTo(Post);

User.hasMany(Comment, {
    as: "author",
    foreignKey: "authorId"
});
Comment.belongsTo(User, {
    foreignKey: "authorId"
})

Like.belongsTo(Comment, {
    foreignKey: "likedCommentId"
});
Comment.hasMany(Like, {
    foreignKey: "likedCommentId",
});

Like.belongsTo(Post, {
    foreignKey: "likedPostId"
});
Post.hasMany(Like, {
    foreignKey: "likedPostId",
});

Like.belongsTo(User, {
    foreignKey: "authorId"
});
User.hasMany(Like, {
    foreignKey: "authorId"
});

Favourite.belongsTo(User, {
    foreignKey: "userId"
});
User.hasMany(Favourite, {
    foreignKey: "userId"
});

Favourite.belongsTo(Post, {
    foreignKey: "postId"
});
Post.hasMany(Favourite, {
    foreignKey: "postId"
});

export {User, Post, Category, Like, Comment, Favourite};