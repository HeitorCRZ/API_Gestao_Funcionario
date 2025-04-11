const Supervisor = require("../model/Supervisores");
const express = require('express');


module.exports = class MiddlewareSupervisor {

    verificarIsSupervisor = async (req, res, next) => {
        const supervisor_id = req.body.supervisor_id;
        const supervisionado_id = req.body.supervisionado_id;

        const supervisor = new Supervisor();
        supervisor.supervisor_id = supervisor_id;
        supervisor.supervisionado_id = supervisionado_id;
        const result = await supervisor.get_supervisores_mesmo_id();
        if (result) {
            return res.status(400).json({
                cod: 7,
                status: false,
                msg: `O funcionario é um Supervisor`,
            });
        }
        next();
    }

    verificarRelacaoExiste = async (req, res, next) => {
        const supervisor_id = req.body.supervisor_id;
        const supervisionado_id = req.body.supervisionado_id;

        const supervisor = new Supervisor();
        supervisor.supervisor_id = supervisor_id;
        supervisor.supervisionado_id = supervisionado_id;
        const result = await supervisor.get_supervisor_especifico();
        if (result) {
            return res.status(400).json({
                cod: 7,
                status: false,
                msg: `Essa relação ja existe`,
            });
        }
        next();
    }

    validarIds = async (req, res, next) => {
        const supervisor_id = req.body.supervisor_id;
        const supervisionado_id = req.body.supervisionado_id;

        const supervisor = new Supervisor();
        supervisor.supervisor_id = supervisor_id;
        supervisor.supervisionado_id = supervisionado_id;

        const resultado = await supervisor.verificar_ids_funcionarios();

        if (!resultado.sucesso) {
            return res.status(400).json({
                cod: 7,
                status: false,
                msg: resultado.mensagem
            });
        }

        next();
    }


}
