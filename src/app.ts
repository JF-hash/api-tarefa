// src/app.ts — só COLA os módulos!
import express, { Request, Response, NextFunction } from "express";
import { logger } from "./middlewares/logger";
import { tarefaRoutes } from "./routes/tarefaRoutes";

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(logger);


// EJS
app.set("view engine", "ejs");
app.set("views", "./src/views");

// Rotas (TODAS importadas de 1 arquivo!)
app.use(tarefaRoutes);

//Rota para testar erro.ejs

app.get('/teste-erro', (req, res, next) => {
    next(new Error('Erro de teste!'));
});

// Iniciar
app.listen(3000, () => {
  console.log("✅ API Tarefas rodando em http://localhost:3000");
});

// Middleware de erro 
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    res.status(500).render('erro', {
        mensagem: err.message,
        status: 500
    });
});


