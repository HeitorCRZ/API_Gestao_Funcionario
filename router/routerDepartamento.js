const express = require('express');
const ControlDepartamento = require('../control/controlDepartamento');
const MiddlewareDepartamento = require('../middleware/middlewareDepartamento');

module.exports = class RouterDepartamento {
    constructor() {
        this._router = express.Router();
        this._controleDepartamento= new ControlDepartamento();
        this._middlewareDepartamento= new MiddlewareDepartamento();
    }
    

    criarRotasDepartamento() {

        this._router.post('/cadastrarCSV/:id',
            this._middlewareDepartamento.validar_autenticacao,   
            this._middlewareDepartamento.uploadJSON, 
            this._middlewareDepartamento.verificarDepartamentoCadastrado,     
            this._middlewareDepartamento.validarNome,                       
            this._middlewareDepartamento.validarOrcamento,                   
            this._middlewareDepartamento.validarDataCriacao,                                                        
            this._middlewareDepartamento.validarCep,        
            this._controleDepartamento.controle_csv_departamento  
        );
       
        this._router.post('/cadastrar',
            this._middlewareDepartamento.validar_autenticacao,     
            this._middlewareDepartamento.verificarDepartamentoCadastrado,     
            this._middlewareDepartamento.validarNome,                       
            this._middlewareDepartamento.validarOrcamento,                   
            this._middlewareDepartamento.validarDataCriacao,                                                        
            this._middlewareDepartamento.validarCep,        
            this._controleDepartamento.controle_departamento_cadastrar  
        );

        this._router.put('/atualizar/:id',
            this._middlewareDepartamento.validar_autenticacao,  
            this._middlewareDepartamento.validarIdDepartamento,
            this._middlewareDepartamento.verificarDepartamentoCadastrado,     
            this._middlewareDepartamento.validarNome,                       
            this._middlewareDepartamento.validarOrcamento,                   
            this._middlewareDepartamento.validarDataCriacao,                                                        
            this._middlewareDepartamento.validarCep,        
            this._controleDepartamento.controle_departamento_atualizar
        );
        this._router.delete('/deletar/:id',
            this._middlewareDepartamento.validar_autenticacao,  
            this._middlewareDepartamento.validarIdDepartamento,
            this._controleDepartamento.controle_departamento_deletar
        );
        this._router.get('/buscar/:id',
            this._middlewareDepartamento.validarIdDepartamento,
            this._controleDepartamento.controle_departamento_por_id
        );
        this._router.get('/buscar',
            this._controleDepartamento.controle_departamento_todos
        );
        this._router.get('/buscarPagina/:id',
            this._middlewareDepartamento.validar_autenticacao,  
            this._controleDepartamento.controle_departamento_readPage
        );     
         // Buscar por nome (filtro)
         this._router.get('/buscarPorNome/:nome',
            this._middlewareDepartamento.validar_autenticacao,
            this._controleDepartamento.controle_departamento_filtrarPorNome
        );
        return this._router

    }
};