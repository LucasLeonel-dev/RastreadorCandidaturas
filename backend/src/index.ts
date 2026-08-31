import fastify from "fastify"; 
import cors from "@fastify/cors";
import autoload from "@fastify/autoload";
import path from "node:path";
import log from "consola";
import { process } from "zod/v4/core";

const app = fastify();
app.register(cors, {origin: "*"});
app.register(autoload, {
    dir:path.join(import.meta.dirname, "routes"),
    routeParams: true
});

app.addHook("onRoute",({ method , path }) => {
    if (method === "HEAD" || method === "OPTIONS") return; 
    log.success(`${method} ${path}`)
});

const port = 3000; 

await app.listen({port, host: "0.0.0.0"}).catch(err => {
    log.error(err);
})
log.success(`Server listening on ${port}`); 