const express = require('express');
const ControlPerfil = require('../control/controlPerfil');
const MiddlewarePerfil = require('../middleware/middlewarePerfil');

module.exports = class RouterPerfil {
    constructor() {
        this._router = express.Router();
        this._controlePerfil= new ControlPerfil();
        this._middlewarePerfil= new MiddlewarePerfil();
    }

    criarRotasPerfil() {
       
        this._router.post('/cadastrar',                         
            this._middlewarePerfil.validarIdade,                   
            this._middlewarePerfil.validarTelefone,                                                        
            this._middlewarePerfil.validarCep,        
            this._controlePerfil.controle_perfil_cadastrar  
        );
        this._router.put('/atualizar/:id',                         
            this._middlewarePerfil.validarIdade,                   
            this._middlewarePerfil.validarTelefone,                                                        
            this._middlewarePerfil.validarCep,        
            this._controlePerfil.controle_perfil_atualizar  
        );
        

        this._router.get('/buscar/:id',
            this._controlePerfil.controle_perfil_buscar
        ); 
        return this._router

    }
};