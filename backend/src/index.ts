import fastify from "fastify"; 
import cors from "@fastify/cors";
import autoload from "@fastify/autoload";

const app = fastify();'
app.register(cors, {origin })