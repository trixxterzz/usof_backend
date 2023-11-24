USOF Backend
Author: jpryshchep
Description: Backend (api/admin panel) part of USOF project

Requirements:
    - NodeJS
    - NPM
    - MySQL

Installation: 
1. Run `npm i` in both usof_backend and admin directories, which will install all the necessary modules
2. Configure database connection in dbCfg.json in usof_backend directory in format:
    {
        "database":*yourDataBaseBame*,
        "username":*yourUsername*,
        "password":*passwordOfYourUserInDataBase*,
        "host":*nameOfHost*,
        "port":*portOfDBConnection*,
        "dialect":"mysql"
    }
3. Run `node index` in both usof_backend and admin directories. Backend api will run on 3000 port, admin panel will run on 5000

System already has default admin profile with credentials:
    login: "admin"
    password: "securepass"

Endpoints:

    •Authentication module:
    
        –POST - /api/auth/register- registration of a new user, required parameters are [login, password, password confirmation, email]
        
        –POST - /api/auth/login- log in user, required parameters are [login, email,password].
        
        –POST - /api/auth/logout- log out authorized user
        
        –POST - /api/auth/password-reset- send a reset link to user email, required parameter is [ email ]
        
        –POST - /api/auth/password-reset/<confirm_token>- confirm new password with atoken from email, required parameter is a [ new password ]
        
    •User module:
    
        -GET - /api/users- get all users

        
        –GET - /api/users/<user_id>- get specified user data
        
        –POST - /api/users- create a new user, required parameters are [login, password,password confirmation, email, role]. This feature is accessible only for admins
        
        –PATCH - /api/users/avatar- upload user avatar
        
        –PATCH - /api/users/<user_id>- update user data
        
        –DELETE - /api/users/<user_id>- delete user
        
    •Post module:
    
        –GET - /api/posts- get all posts. 
        
        –GET - /api/posts/<post_id>- get specified post data. Endpoint is public
        
        –GET - /api/posts/<post_id>/comments- get all comments for the specified post.Endpoint is public
        
        –POST - /api/posts/<post_id>/comments- create a new comment, required parameteris [ content ]
        
        –GET - /api/posts/<post_id>/categories- get all categories associated with thespecified post
        
        –GET - /api/posts/<post_id>/like- get all likes under the specified post
        
        –POST - /api/posts/- create a new post, required parameters are [title, content,categories]
        
        –POST - /api/posts/<post_id>/like- create a new like under a post
        
        –PATCH - /api/posts/<post_id>- update the specified post (its title, body or category). It's accessible only for the creator of the post
        
        –DELETE - /api/posts/<post_id>- delete a post
        
        –DELETE - /api/posts/<post_id>/like- delete a like under a post
        
    •Categories module:
    
        –GET - /api/categories- get all categories
        
        –GET - /api/categories/<category_id>- get specified category data
        
        –GET - /api/categories/<category_id>/posts- get all posts associated with thespecified category
        
        –POST - /api/categories- create a new category, required parameter is [title]
        
        –PATCH - /api/categories/<category_id>- update specified category data
        
        –DELETE - /api/categories/<category_id>- delete a category
        
    •Comments module:
    
        –GET - /api/comments/<comment_id>- get specified comment data
        
        –GET - /api/comments/<comment_id>/like- get all likes under the specified comment
        
        –POST - /api/comments/<comment_id>/like- create a new like under a comment
        
        –PATCH - /api/comments/<comment_id>- update specified comment data
        
        –DELETE - /api/comments/<comment_id>- delete a comment
        
        –DELETE - /api/comments/<comment_id>/like- delete a like under a comment
        
    •Favourites module:
    
        -GET - /api/favourites/ - get favourite posts of logged in user
        
        -POST - /api/favourites/<post_id> - add post to favourites list
        
        -DELETE - /api/favourites/<post_id> - delete post from favourites list
        
