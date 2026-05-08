// src/controllers/tarefaController.ts
import { Request, Response } from "express";
import * as TarefaModel from "../models/tarefaModel";
import { ApiResponse, Tarefa, FiltroQuery } from "../interfaces";

export async function listar(req: Request<{},{},{},FiltroQuery>, res: Response) {
  try {
    let tarefas = await TarefaModel.listarTodas();
    if (req.query.concluida === "true") tarefas = tarefas.filter(t => t.concluida);
    if (req.query.concluida === "false") tarefas = tarefas.filter(t => !t.concluida);
    if (req.query.prioridade) tarefas = tarefas.filter(t => t.prioridade === req.query.prioridade);
    res.json({ sucesso: true, dados: tarefas } as ApiResponse<Tarefa[]>);
  } catch { res.status(500).json({ sucesso: false, erro: 'Erro interno' }); }
}

export async function criar(req: Request, res: Response) {
  try {
    const { titulo, descricao, prioridade } = req.body;
    const erros: string[] = [];
    if (!titulo || typeof titulo !== "string") erros.push("titulo é obrigatório");
    if (!["alta","media","baixa"].includes(prioridade)) erros.push("prioridade inválida");
    if (erros.length > 0) { res.status(400).json({ sucesso:false, erros }); return; }
    const nova = await TarefaModel.criar({ titulo, descricao, prioridade });
    res.status(201).json({ sucesso: true, dados: nova });
  } catch { res.status(500).json({ sucesso: false, erro: 'Erro interno' }); }
}

// --- FUNÇÕES DA API (JSON) ---

export async function buscarPorId(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ sucesso: false, erro: 'ID inválido' });

        const tarefa = await TarefaModel.buscarPorId(id);
        if (!tarefa) {
            return res.status(404).json({ sucesso: false, erro: 'Tarefa não encontrada' });
        }
        res.json({ sucesso: true, dados: tarefa } as ApiResponse<Tarefa>);
    } catch (error) {
        res.status(500).json({ sucesso: false, erro: 'Erro ao buscar tarefa' });
    }
}

export async function atualizar(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ sucesso: false, erro: 'ID inválido' });

        const dadosAtualizados = req.body;
        const tarefa = await TarefaModel.atualizar(id, dadosAtualizados);
        if (!tarefa) {
            return res.status(404).json({ sucesso: false, erro: 'Tarefa não encontrada' });
        }
        res.json({ sucesso: true, dados: tarefa } as ApiResponse<Tarefa>);
    } catch (error) {
        res.status(500).json({ sucesso: false, erro: 'Erro ao atualizar tarefa' });
    }
}

export async function remover(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ sucesso: false, erro: 'ID inválido' });

        const removido = await TarefaModel.remover(id);
        if (!removido) {
            return res.status(404).json({ sucesso: false, erro: 'Tarefa não encontrada' });
        }
        res.json({ sucesso: true, mensagem: 'Tarefa removida com sucesso' });
    } catch (error) {
        res.status(500).json({ sucesso: false, erro: 'Erro ao remover tarefa' });
    }
}

// --- FUNÇÕES DE PÁGINAS (EJS) ---

export async function listarPagina(req: Request, res: Response) {
    try {
        const tarefas = await TarefaModel.listarTodas();
        res.render("tarefas", { tarefas });
    } catch (error) {
        res.status(500).send("Erro ao carregar a página de tarefas");
    }
}

export async function detalhePagina(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).send("ID inválido");

        const tarefa = await TarefaModel.buscarPorId(id);
        if (!tarefa) return res.status(404).send("Tarefa não encontrada");
        res.render("detalhe", { tarefa });
    } catch (error) {
        res.status(500).send("Erro ao carregar detalhes");
    }
}

export async function cadastrarPagina(req: Request, res: Response) {
    res.render("cadastrar");
}

export async function cadastrarForm(req: Request, res: Response) {
    try {
        const { titulo, descricao, prioridade } = req.body;
        await TarefaModel.criar({ titulo, descricao, prioridade });
        res.redirect("/pagina/tarefas");
    } catch (error) {
        res.status(500).send("Erro ao processar cadastro");
    }
}

export async function concluirForm(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        if (!isNaN(id)) {
            await TarefaModel.atualizar(id, { concluida: true });
        }
        res.redirect("/pagina/tarefas");
    } catch (error) {
        res.status(500).send("Erro ao concluir tarefa");
    }

}
export async function tarefasPagina(req: Request, res: Response) {
  const tarefas = await TarefaModel.listarTodas();
  res.render("tarefas", { tarefas });
}

export async function excluirForm(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        if (!isNaN(id)) {
            await TarefaModel.remover(id);
        }
        res.redirect("/pagina/tarefas");
    } catch (error) {
        res.status(500).send("Erro ao excluir tarefa");
    }
}