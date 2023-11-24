import AdminJS from 'adminjs'
import AdminJSExpress from '@adminjs/express'
import express from 'express'
//import { DataTypes, Model} from 'sequelize';
import * as AdminJSSequelize from '@adminjs/sequelize'
//import sequelize from '../usof_backend/index.js';
import {User, Post, Category, Like, Comment} from "../usof_backend/connections.js"
import bcrypt from "bcrypt";

const PORT = 5000;

AdminJS.registerAdapter({
    Resource: AdminJSSequelize.Resource,
    Database: AdminJSSequelize.Database,
})

async function authenticate(email, password){
    let user = await User.findOne({where: {email: email}});
    if (!user) return null;
    if (user.role != "Admin") return null;
    if (!bcrypt.compareSync(password, user.password)) return null;
    return user;
}

const start = async () => {
    const app = express();
  
    const admin = new AdminJS({
        resources: [
            {
                resource: User,
                options: {
                    properties: {
                        rating: {
                            isVisible: false
                        },
                        profile_picture: {
                            isVisible: false
                        },
                        createdAt: {
                            isVisible: false
                        },
                        updatedAt: {
                            isVisible: false
                        }
                    }
                },
                properties: {
                    authorId: "login"
                }
            },
            {
                resource: Post,
                options: {}
            },
            {
                resource: Category,
                options: {}
            },
            {
                resource: Comment,
                options: {}
            },
            {
                resource: Like,
                options: {}
            }
        ]
    });

  
    const adminRouter = AdminJSExpress.buildAuthenticatedRouter(admin,
        {
            authenticate,
            cookieName: 'usofAdmin',
            cookiePassword: 'usofAdmin'
          },
          null,
          {
            secret: 'securepass',
            resave: true,
            saveUninitialized: true,
          }
          );
    app.use(admin.options.rootPath, adminRouter);

    app.listen(PORT, () => {
      console.log(`AdminJS started on http://localhost:${PORT}${admin.options.rootPath}`)
    })
  }
  
  start()
