const express = require('express');
const Departamento = require("../model/Departamentos");
const axios = require('axios');

module.exports = class ControlDepartamento {


    async controle_csv_departamento(request, response) {
        try {
            const lista = request.body.departamentos;
            if (!Array.isArray(lista)) {
                return response.status(400).json({ msg: 'Dados de departamentos inválidos' });
            }

            const departamentosCriados = [];
            const departamentosDuplicados = [];
            const usuario_logado = request.params.id;
            for (const dados of lista) {
                const departamento = new Departamento();
                departamento._usuario_logado = usuario_logado;
                departamento.nome = dados.nome;
                departamento.orcamento = dados.orcamento;
                departamento.localizacao = dados.localizacao;
                departamento.data_criacao = dados.data_criacao;

                const existe = await departamento.verificarDepartamento();

                if (!existe) {
                    const criado = await departamento.post_departamento();
                    if (criado) departamentosCriados.push(departamento);
                } else {
                    departamentosDuplicados.push(dados.nome);
                }
            }

            return response.status(200).json({
                message: 'Departamentos processados com sucesso!',
                processados: departamentosCriados.length,
                duplicados: departamentosDuplicados.length,
                nomes_duplicados: departamentosDuplicados
            });

        } catch (error) {
            console.error("Erro ao processar CSV:", error);
            return response.status(500).json({ error: 'Erro interno do servidor!' });
        }
    }


    async controle_departamento_cadastrar(req, res) {
        let cep = req.body.localizacao;
        cep = cep.replace(/\D/g, ''); // remove tudo que não for número
        const resposta = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);

        const endereco = resposta.data;
        const enderecoCompleto = `${endereco.logradouro}, ${endereco.bairro}, ${endereco.localidade} - ${endereco.uf}, CEP: ${endereco.cep}`;

        const departamento = new Departamento();
        departamento.nome = req.body.nome;
        departamento.orcamento = req.body.orcamento;
        departamento.localizacao = enderecoCompleto;
        departamento.data_criacao = req.body.data_criacao;
        departamento.usuario_logado = req.body.usuario_logado;


        const departamentoCriado = await departamento.post_departamento();

        const objResposta = {
            cod: 1,
            status: departamentoCriado,
            msg: departamentoCriado ? 'Departamento criado com sucesso' : 'Erro ao cadastrar Departamento'
        };
        res.status(200).send(objResposta);
    }
    async controle_departamento_atualizar(req, res) {
        const id = req.params.id;
        let cep = req.body.localizacao;
        cep = cep.replace(/\D/g, ''); // remove tudo que não for número
        const resposta = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);

        const endereco = resposta.data;
        const enderecoCompleto = `${endereco.logradouro}, ${endereco.bairro}, ${endereco.localidade} - ${endereco.uf}, CEP: ${endereco.cep}`;

        const departamento = new Departamento();
        departamento._departamento_id = id;
        departamento.nome = req.body.nome;
        departamento.orcamento = req.body.orcamento;
        departamento.localizacao = enderecoCompleto;
        departamento.data_criacao = req.body.data_criacao;
        departamento.usuario_logado = req.body.usuario_logado;

        const atualizado = await departamento.put_departamento();

        const objResposta = {
            cod: 2,
            status: atualizado,
            msg: atualizado ? 'Departamento atualizado com sucesso' : 'Erro ao atualizar departamento'
        };

        res.status(200).send(objResposta);
    }
    async controle_departamento_deletar(req, res) {
        const id = req.params.id;
        const usuario_logado = req.query.usuario_logado;

        const departamento = new Departamento();
        departamento._departamento_id = id;
        departamento.usuario_logado = usuario_logado;

        const deletado = await departamento.delete_departamento();

        const objResposta = {
            cod: 3,
            status: deletado,
            msg: deletado ? 'Departamento deletado com sucesso' : 'Erro ao deletar departamento'
        };

        res.status(200).send(objResposta);
    }
    async controle_departamento_por_id(req, res) {
        const id = req.params.id;

        const departamento = new Departamento();
        departamento._departamento_id = id;

        const resultado = await departamento.get_departamento_by_id();

        const objResposta = {
            cod: 4,
            status: !!resultado,
            dados: resultado,
            msg: resultado ? 'Departamento encontrado' : 'Departamento não encontrado'
        };

        res.status(200).send(objResposta);
    }


    async controle_departamento_filtrarPorNome(req, res) {
        const nome = req.params.nome;

        const departamento = new Departamento();
        departamento._nome = nome;

        const resultado = await departamento.get_Departamento_por_nome();

        const objResposta = {
            cod: 6,
            status: Array.isArray(resultado) && resultado.length > 0,
            msg: '',
            dados: []
        };

        if (resultado === false) {
            objResposta.msg = 'Erro interno ao buscar departamentos';
        } else if (resultado.length === 0) {
            objResposta.msg = 'Nenhum departamento encontrado com esse nome';
        } else {
            objResposta.msg = 'Departamentos encontrados com sucesso';
            objResposta.dados = resultado;
        }

        res.status(200).send(objResposta);
    }
    
    async controle_departamento_todos(req, res) {
        const departamento = new Departamento();

        const resultado = await departamento.get_all_departamentos();

        const objResposta = {
            cod: 5,
            status: resultado.length > 0,
            dados: resultado,
            msg: resultado.length > 0 ? 'Departamentos encontrados' : 'Nenhum departamento encontrado'
        };

        res.status(200).send(objResposta);
    }
    async controle_departamento_readPage(request, response) {
        const id = parseInt(request.params.id)
        const departamento = new Departamento();
        const resultadoDepartamento = await departamento.readPage(id);

        const objResposta = {
            cod: 1,
            status: true,
            dados: resultadoDepartamento
        };
        response.status(200).send(objResposta);
    }

}