import fastifyJwt from "@fastify/jwt";
import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";

//tem que fazer pra exportar
export default fp(async function jwtPlugin (app: FastifyInstance) {
    app.register (fastifyJwt, {
        secret: process.env.JWT_SECRET!,
        sign: {
            expiresIn: process.env.JWT_EXPIRES_IN,
        }
    })
})
