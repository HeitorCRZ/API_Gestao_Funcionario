const express = require('express');
const ControlHistoricoCargo = require('../control/controlHistoricoCargo');

module.exports = class RouterHistoricoCargo {
    constructor() {
        this._router = express.Router();
        this._controleHistoricoCargo = new ControlHistoricoCargo();
    }

    criarRotasHistoricoCargo() {
       
        this._router.get('/buscar/:id',
            this._controleHistoricoCargo.controle_historicoCargo_Buscar
        ); 
        this._router.delete('/deletar/:id',
            this._controleHistoricoCargo.controle_historicoCargo_Deletar
        ); 
        return this._router

    }
};