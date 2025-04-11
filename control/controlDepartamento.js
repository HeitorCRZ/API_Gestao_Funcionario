const express = require('express');
const Departamento = require("../model/Departamentos");
const axios = require('axios');

module.exports = class ControlDepartamento {


    async controle_csv_departamento(request, response) {
        try {
            const file = request.file;

            if (!file || !file.path) {
                return response.status(400).json({ error: 'Arquivo CSV não encontrado!' });
            }

            const ponteiroArquivo = fs.createReadStream(file.path);
            const leitorLinha = readline.createInterface({
                input: ponteiroArquivo,
                crlfDelay: Infinity,
            });

            let i = 0;
            const departamentosCriados = [];
            let qtdDepartamentosDuplicados = 0;
            const departamentosDuplicados = [];

            for await (const linhaArquivo of leitorLinha) {
                const campos = linhaArquivo.split(';');

                const departamento = new Departamento();
                departamento.nome = campos[0];
                departamento.orcamento = campos[1];
                departamento.localizacao = campos[2];
                departamento.data_criacao = campos[3];
               
                const existeDepartamento = await departamento.verificarDepartamento(); // Verifica se já existe
                if (!existeDepartamento) {
                    const departamentoCriado = await departamento.post_departamento();
                    if (departamentoCriado) {
                        departamentosCriados.push(departamento);
                        i++;
                    }
                } else {
                    qtdDepartamentosDuplicados++;
                    departamentosDuplicados.push(funcionario.nome);
                }
            }

            console.log('Departamentos processados:', departamentosCriados);
            console.log('Quantidade de Departamentos duplicados:', qtdDepartamentosDuplicados);
            console.log('Departamentos duplicados:', departamentosDuplicados);

            return response.status(200).json({
                message: 'Arquivo processado com sucesso!',
                processados: departamentosCriados.length,
                duplicados: qtdDepartamentosDuplicados,
            });

        } catch (error) {
            console.error("Erro ao processar CSV de Departamentos:", error);
            return response.status(500).json({ error: 'Erro interno do servidor!' });
        }
    }


    async controle_departamento_cadastrar(req, res) {
        console.log("Cep -> " + req.body.localizacao);
        let cep = req.body.localizacao;
        cep = cep.replace(/\D/g, ''); // remove tudo que não for número
        console.log("CEP normalizado2 ---> " + cep);
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
        const usuario_logado = req.body.usuario_logado;

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