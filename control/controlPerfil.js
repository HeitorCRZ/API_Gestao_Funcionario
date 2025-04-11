const express = require('express');
const Perfil = require("../model/Perfis");
const axios = require('axios');

module.exports = class ControlPerfil {
  
    async controle_perfil_cadastrar(req, res) {
        try {
            let cep = req.body.endereco;
            cep = cep.replace(/\D/g, '');
    
            const resposta = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
            const endereco = resposta.data;
    
            const enderecoCompleto = `${endereco.logradouro}, ${endereco.bairro}, ${endereco.localidade} - ${endereco.uf}, CEP: ${endereco.cep}`;
    
            const perfil = new Perfil();
            perfil.idade = req.body.idade;
            perfil.telefone = req.body.telefone;
            perfil.endereco = enderecoCompleto;
            perfil.genero = req.body.genero;
            perfil.estado_civil = req.body.estado_civil;
            perfil.usuario_logado = req.body.usuario_logado;
    
            const perfilCriado = await perfil.post_perfil();
    
            const objResposta = {
                cod: 1,
                status: perfilCriado,
                msg: perfilCriado ? 'Perfil criado com sucesso' : 'Erro ao cadastrar perfil'
            };
            res.status(200).send(objResposta);
        } catch (error) {
            res.status(500).send({ cod: -1, status: false, msg: 'Erro interno ao cadastrar perfil', erro: error.message });
        }
    }

    async controle_perfil_buscar(req, res) {
        const id = req.params.id;
    
        const perfil = new Perfil();
        perfil.funcionario_id = id;
    
        const resultado = await perfil.get_perfil_by_id();
    
        const objResposta = {
            cod: 4,
            status: !!resultado,
            dados: resultado,
            msg: resultado ? 'perfil encontrado' : 'perfil não encontrado'
        };
        res.status(200).send(objResposta);
    }
    async controle_perfil_atualizar(req, res) {
        let cep = req.body.endereco;
        cep = cep.replace(/\D/g, ''); // remove tudo que não for número
        const resposta = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);

        const endereco = resposta.data;
        const enderecoCompleto = `${endereco.logradouro}, ${endereco.bairro}, ${endereco.localidade} - ${endereco.uf}, CEP: ${endereco.cep}`;

        const perfil = new Perfil();
        perfil.idade = req.body.idade;
        perfil.telefone = req.body.telefone;
        perfil.endereco = enderecoCompleto;
        perfil.genero = req.body.genero;
        perfil.estado_civil = req.body.estado_civil;
        perfil.usuario_logado = req.params.id;

        const atualizado = await perfil.put_perfil();

        const objResposta = {
            cod: 2,
            status: atualizado,
            msg: atualizado ? 'Perfil atualizado com sucesso' : 'Erro ao atualizar Perfil'
        };

        res.status(200).send(objResposta);
    }
}
