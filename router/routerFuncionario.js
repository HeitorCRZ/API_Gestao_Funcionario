const express = require('express');
const ControlFuncionario = require('../control/controlFuncionarios');
const MiddlewareFuncionario = require('../middleware/middlewareFuncionarios');

module.exports = class RouterFuncionario {
    constructor() {
        this._router = express.Router();
        this._controleFuncionario = new ControlFuncionario();
        this._middlewareFuncionario = new MiddlewareFuncionario();
    }

    criarRotasFuncionario() {

        const multer = require('multer');
        const upload = multer({ dest: 'uploads/' });

        this._router.post('/login',
            this._middlewareFuncionario.validarDadosFuncionario,
            this._middlewareFuncionario.verificarFuncionarioExistente,
            this._controleFuncionario.controle_funcionario_login
        )


        this._router.post('/cadastrarCSV/:id',
            this._middlewareFuncionario.validar_autenticacao,
            this._middlewareFuncionario.uploadJSON,
            this._middlewareFuncionario.validarNome,
            this._middlewareFuncionario.validarSenha,
            this._middlewareFuncionario.validarEmail,
            this._middlewareFuncionario.validarCargo,
            this._middlewareFuncionario.validarDepartamento_id,
            this._middlewareFuncionario.validarCPF,
            this._middlewareFuncionario.validarSalario,
            this._middlewareFuncionario.validarDataContratacao,
            this._middlewareFuncionario.verificarEmailCadastrado,
            this._controleFuncionario.controle_csv_funcionario
        );
        this._router.post('/cadastrar',
            this._middlewareFuncionario.validar_autenticacao,
            this._middlewareFuncionario.validarNome,
            this._middlewareFuncionario.validarSenha,
            this._middlewareFuncionario.validarEmail,
            this._middlewareFuncionario.validarCargo,
            this._middlewareFuncionario.validarDepartamento_id,
            this._middlewareFuncionario.validarCPF,
            this._middlewareFuncionario.validarSalario,
            this._middlewareFuncionario.validarDataContratacao,
            this._middlewareFuncionario.verificarEmailCadastrado,
            this._controleFuncionario.controle_funcionario_cadastrar
        );

        this._router.put('/atualizar/:id',
            this._middlewareFuncionario.validar_autenticacao,
            this._middlewareFuncionario.validarIdFuncionario,
            this._middlewareFuncionario.validarNome,
            this._middlewareFuncionario.verificarEmailCadastrado,
            this._middlewareFuncionario.validarCargo,
            this._middlewareFuncionario.validarDepartamento_id,
            this._middlewareFuncionario.validarCPF,
            this._middlewareFuncionario.validarSalario,
            this._middlewareFuncionario.validarDataContratacao,
            this._controleFuncionario.controle_funcionario_atualizar
        );

        this._router.delete('/deletar/:id',
            this._middlewareFuncionario.validar_autenticacao,
            this._middlewareFuncionario.validarIdFuncionario,
            this._controleFuncionario.controle_funcionario_deletar
        );

        this._router.get('/buscar/:id',
            this._middlewareFuncionario.validarIdFuncionario,
            this._controleFuncionario.controle_funcionario_por_id
        );

        this._router.get('/buscar',
            this._middlewareFuncionario.validar_autenticacao,
            this._controleFuncionario.controle_funcionario_todos
        );

        this._router.get('/buscarPagina/:id',
            this._middlewareFuncionario.validar_autenticacao,
            this._controleFuncionario.controle_funcionario_readPage
        ); 

        this._router.get('/relatorios',
            this._middlewareFuncionario.validar_autenticacao,
            this._controleFuncionario.controle_funcionario_dadosRelatorio
        );
        return this._router

    }
};