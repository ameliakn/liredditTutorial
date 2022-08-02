import "reflect-metadata"
import { MikroORM } from "@mikro-orm/core"
import { __prod__ } from "./constants";
//import { Post } from "./entities/Post";
import mikroOrmConfig from "./mikro-orm.config";
import express from 'express';
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import { createClient } from "redis"
import session from "express-session";
import connectRedis from 'connect-redis'
import { MyContext } from "./types";

const main = async () => {

    const orm = await MikroORM.init(mikroOrmConfig);
    await orm.getMigrator().up();
    const fork = orm.em.fork();
    const app = express()

    const RedisStore = connectRedis(session)
    const redisClient = createClient({ legacyMode: true })
    redisClient.connect()

    app.use(
        session({
            name: 'qid',
            store: new RedisStore(
                {
                    client: redisClient,
                    disableTouch: true,
                    disableTTL: true,
                })
            ,
            cookie: {
                maxAge: 1000 * 60 * 24 * 365 * 10,
                httpOnly: false,
                sameSite: 'lax',
                secure: __prod__
            },
            saveUninitialized: false,
            secret: "ytgftfrdeewsawa",
            resave: false
        })
    )

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false
        }),
        context: ({ req, res }): MyContext => ({ em: fork, req, res }),
    })

    await apolloServer.start()

    apolloServer.applyMiddleware({
        app,
        cors: {
            origin: ["https://studio.apollographql.com"],
            credentials: true
        }
    });

    app.listen(4000, () => console.log('server started on localhost:4000'))
}

main().catch(err => {
    console.error(err)
});