const express = require('express');
const HistoricoCargo = require("../model/HistoricoCargos");

module.exports = class ControlHistoricoCargo {
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
