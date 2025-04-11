const express = require('express');
const ControlHistoricoCargo = require('../control/controlHistoricoCargo');
const MiddlewareHistoricoCargo = require('../middleware/middlewareHistoricoCargo');

module.exports = class RouterHistoricoCargo {
    constructor() {
        this._router = express.Router();
        this._controleHistoricoCargo = new ControlHistoricoCargo();
        this._middlewareHistoricoCargo= new MiddlewareHistoricoCargo();
    }

    criarRotasHistoricoCargo() {
       
        this._router.post('/cadastrar',                         
            this._middlewareHistoricoCargo.validarCargos,                                          
            this._controleHistoricoCargo.controle_historicoCargo_Cadastrar  
        );
        
        this._router.get('/buscar/:id',
            this._controleHistoricoCargo.controle_historicoCargo_Buscar
        ); 
        this._router.delete('/deletar/:id',
            this._controleHistoricoCargo.controle_historicoCargo_Deletar
        ); 
        return this._router

    }
};