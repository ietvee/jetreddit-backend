// import "reflect-metadata";
// import { COOKIE_NAME, __prod__ } from "./constants";
// import { Post } from "./entities/Post";
// import express from "express";
// import { ApolloServer } from "apollo-server-express";
// import { buildSchema } from "type-graphql";
// import { HelloResolver } from "./resolvers/hello";
// import { PostResolver } from "./resolvers/post";
// import { UserResolver } from "./resolvers/user";
// import Redis from "ioredis";
// import session from "express-session";
// import connectRedis from "connect-redis";
// import cors from "cors";
// import { createConnection } from "typeorm";
// import { User } from "./entities/User";
// // import { MikroORM } from "@mikro-orm/core";
// // import microConfig from "./mikro-orm.config";

// const main = async () => {
//   // sendEmail("jet@jet.com", "hello there :D");
//   // connect to database
//   // typeORM
//   const conn = await createConnection({
//     type: "postgres",
//     database: "jetreddit2",
//     username: "postgres",
//     password: "jetjet",
//     logging: true,
//     synchronize: true,
//     entities: [Post, User],
//   });

//   await Post.delete({});
//   // mikroORM
//   // const orm = await MikroORM.init(microConfig);
//   // // await orm.em.nativeDelete(User, {});
//   // await orm.getMigrator().up();
//   const app = express();

//   const RedisStore = connectRedis(session);
//   const redis = new Redis();

//   // const corsOptions = {
//   //     origin: 'https://studio.apollographql.com',
//   //     credentials: true
//   // }

//   app.use(
//     cors({
//       origin: "http://localhost:3000",
//       credentials: true,
//     })
//   );
//   app.use(
//     // cors(corsOptions),
//     // function(req, res)
//     // {  res.header("Access-Control-Allow-Origin", "https://studio.apollographql.com"); // update to match the domain you will make the request from
//     // res.header("Access-Control-Allow-Headers", "*");},
//     session({
//       name: COOKIE_NAME,
//       store: new RedisStore({
//         client: redis as any,
//         disableTouch: true,
//       }),
//       cookie: {
//         // path: "/",
//         maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
//         httpOnly: true,
//         sameSite: "lax", // csrf
//         // sameSite : "none",
//         secure: __prod__, // cookie only works in https
//       },
//       saveUninitialized: false,
//       secret: "kjhgruhiuhfrhgurhgr",
//       resave: false,
//     })
//   );

//   const apolloServer = new ApolloServer({
//     schema: await buildSchema({
//       resolvers: [HelloResolver, PostResolver, UserResolver],
//       validate: false,
//     }),
//     // context - is a s
//     context: ({ req, res }) => ({ req, res, redis }),
//   });

//   await apolloServer.start();
//   apolloServer.applyMiddleware({
//     app,
//     cors: false,
//   });

//   app.listen(4000, () => {
//     console.log("server tarted");
//   });

//   // const generator = orm.getSchemaGenerator();
//   // await generator.updateSchema();

//   //// const post = orm.em.create(Post,{title: 'my first post'});
//   //// await orm.em.persistAndFlush(post);
//   //// await orm.em.nativeInsert(Post, {title: 'my second post'} )
//   // const posts = await orm.em.find(Post, {});
//   // console.log(posts);
// };

// main().catch((err) => {
//   console.log(err);
// });

import "reflect-metadata";
import { __prod__, COOKIE_NAME } from "./constants";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import Redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";
import cors from "cors";
import { createConnection } from "typeorm";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import path from "path";
import { Updoot } from "./entities/Updoot";
import { createUserLoader } from "./utils/createUserLoader";
import { createUpdootLoader } from "./utils/createUpdootLoader";

const main = async () => {
  const conn = await createConnection({
    type: "postgres",
    database: "jetreddit2",
    username: "postgres",
    password: "jetjet",
    logging: true,
    synchronize: true,
    migrations: [path.join(__dirname, "./migrations/*")],
    entities: [Post, User, Updoot],
  });

  // migration nknknkdd
  await conn.runMigrations();

  // // to delete post , then about synchronize need to set to true
  // await Post.delete({});

  const app = express();

  const RedisStore = connectRedis(session);
  const redis = new Redis();
  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );
  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis as any,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        sameSite: "lax", // csrf
        secure: __prod__, // cookie only works in https
      },
      saveUninitialized: false,
      secret: "kjhgruhiuhfrhgurhgr",
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({
      req,
      res,
      redis,
      userLoader: createUserLoader(),
      updootLoader: createUpdootLoader(),
    }),
  });

  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  app.listen(4000, () => {
    console.log("server started on localhost:4000");
  });
};

main().catch((err) => {
  console.error(err);
});
