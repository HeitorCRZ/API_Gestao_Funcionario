const express = require('express');
const HistoricoCargo = require("../model/HistoricoCargos");

module.exports = class ControlHistoricoCargo {
  
    async controle_historicoCargo_Cadastrar(req, res) {
        const cargo_anterior = req.body.cargo_anterior;
        const novo_cargo = req.body.novo_cargo;
        const funcionario_id = req.body.funcionario_id;
        const usuario_logado = req.body.usuario_logado;
        
        const historico_cargo = new HistoricoCargo();
        historico_cargo._cargo_anterior = cargo_anterior;
        historico_cargo._novo_cargo = novo_cargo;
        historico_cargo._funcionario_id = funcionario_id;
        historico_cargo._usuario_logado = usuario_logado;

        const resultado = await historico_cargo.post_historicoCargo();

        const objResposta = {
            cod: 1,
            status: resultado,
            msg: resultado ? 'Historico de cargos atualizado' : 'Historico de cargos não foi inserido'
        };
        res.status(200).send(objResposta);
    }
    async controle_historicoCargo_Buscar(req, res) {
        const id = req.params.id;

        const historico_cargo = new HistoricoCargo();
        historico_cargo.funcionario_id = id;

        const resultado = await historico_cargo.get_historicoCargos();

        const objResposta = {
            cod: 4,
            status: !!resultado,
            dados: resultado,
            msg: resultado ? 'Historico encontrado' : 'Historico não encontrado'
        };

        res.status(200).send(objResposta);
    }

    async controle_historicoCargo_Deletar(req, res) {
        const id = req.params.id;
        const usuario_logado = req.body.usuario_logado;

        const historico_cargo = new HistoricoCargo();
        historico_cargo._id = id;
        historico_cargo._usuario_logado = usuario_logado;

        const resultado = await historico_cargo.delete_historicoCargo();

        const objResposta = {
            cod: 4,
            status: !!resultado,
            dados: resultado,
            msg: resultado ? 'historico_cargo deletado' : 'historico_cargo não deletado'
        };

        res.status(200).send(objResposta);
    }
}
