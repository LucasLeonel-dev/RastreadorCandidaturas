import fastify from "fastify"; 
import cors from "@fastify/cors";
import autoload from "@fastify/autoload";
import path from "node:path";

const app = fastify();
app.register(cors, {origin: "*"});
app.register(autoload, {
    dir:path.join(import.meta.dirname, "routes"),
    routeParams: true
});

app.get('/', () => {
    return "rota raiz"
})

app.get('/health', ()=> {
    return 'Hello NLW'
} ) //endereco health vai mandar hello nlw para tela
//cada rota devera realizar alguma operacao 

app.addHook("onRoute",({ method , path }) => {
    if (method === "HEAD" || method === "OPTIONS") return; 
    console.log(`${method} ${path}`)
});

 
await app.listen({port: 3333}).then(() => { //quando rodar ent...
    console.log("HTTP server running!")
})
