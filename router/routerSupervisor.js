const express = require('express');
const ControlSupervisor = require('../control/controlSupervisor');
const MiddlewareSupervisor = require('../middleware/middlewareSupervisor');

module.exports = class RouterSupervisor {
    constructor() {
        this._router = express.Router();
        this._controleSupervisor = new ControlSupervisor();
        this._middlewareSupervisor = new MiddlewareSupervisor();
    }

    criarRotasSupervisor() {
        this._router.post('/cadastrar',
            (req, res, next) => this._middlewareSupervisor.verificarIsSupervisor(req, res, next),
            (req, res, next) => this._middlewareSupervisor.validarIds(req, res, next),
            (req, res, next) => this._middlewareSupervisor.verificarRelacaoExiste(req, res, next),
            (req, res) => this._controleSupervisor.controle_supervisor_cadastrar(req, res)
        );

        this._router.get('/buscar',
            (req, res) => this._controleSupervisor.controle_supervisor_buscar(req, res)
        );

        this._router.delete('/deletarSupervisor/:id',
            (req, res) => this._controleSupervisor.controle_supervisor_deletarSupervisor(req, res)
        );

        this._router.delete('/deletarSupervisionado',
            (req, res) => this._controleSupervisor.controle_supervisor_deletarSupervisionado(req, res)
        );

        return this._router;
    }
};
