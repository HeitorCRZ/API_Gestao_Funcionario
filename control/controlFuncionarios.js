const express = require('express');
const Funcionario = require("../model/Funcionarios");
const fs = require('fs');
const MeuTokenJWT = require(".././model/MeuTokenJWT")
const multer = require('multer');
const readline = require('readline');




module.exports = class ControlFuncionario {






    async controle_funcionario_login(req, res) {
        try {
            const objToken = new MeuTokenJWT();
            const senha = req.body.senha;
            const email = req.body.email;


            const objClaimsToken = {
                email: email,
                senha: senha,
            };


            const novoToken = objToken.gerarToken(objClaimsToken);
            const objFuncionario = req.funcionario;


            const objResposta = {
                resposta: "Sucesso ao logar",
                token: novoToken,
                Funcionario: objFuncionario.nome,
                cargo: objFuncionario.cargo,
                status: true
            };


            res.status(200).send(objResposta);
        } catch (error) {
            console.log("Errro >>>", error)
            return false
        }
    }


    async controle_csv_funcionario(request, response) {
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
            const funcionariosCriados = [];
            let qtdFuncionariosDuplicados = 0;
            const funcionariosDuplicados = [];


            for await (const linhaArquivo of leitorLinha) {
                const campos = linhaArquivo.split(';');


                const funcionario = new Funcionario();
                funcionario.nome = campos[0];
                funcionario.email = campos[1];
                funcionario.cpf = campos[2];
                funcionario.senha = campos[3];
                funcionario.salario = campos[4];
                funcionario.data_contratacao = campos[5];
                funcionario.departamento_id = campos[6];
                funcionario.cargo_id = campos[7];


                const existeFuncionario = await funcionario.get_Funcionario(); // Verifica se já existe
                if (!existeFuncionario) {
                    const Funcionariocriado = await funcionario.post_funcionario();
                    if (Funcionariocriado) {
                        funcionariosCriados.push(funcionario);
                        i++;
                    }
                } else {
                    qtdFuncionariosDuplicados++;
                    funcionariosDuplicados.push(funcionario.nome);
                }
            }


            console.log('Funcionários processados:', funcionariosCriados);
            console.log('Quantidade de Funcionários duplicados:', qtdFuncionariosDuplicados);
            console.log('Funcionários duplicados:', funcionariosDuplicados);


            return response.status(200).json({
                message: 'Arquivo processado com sucesso!',
                processados: funcionariosCriados.length,
                duplicados: qtdFuncionariosDuplicados,
            });


        } catch (error) {
            console.error("Erro ao processar CSV de funcionários:", error);
            return response.status(500).json({ error: 'Erro interno do servidor!' });
        }
    }


    async controle_funcionario_cadastrar(req, res) {
        const nome = req.body.nome;
        const email = req.body.email;
        const cpf = req.body.cpf;
        const cargo = req.body.cargo;
        const salario = req.body.salario;
        const data_contratacao = req.body.data_contratacao;
        const departamento_id = req.body.departamento_id;
        const senha = req.body.senha;
        const usuario_logado = req.body.usuario_logado;


        const funcionario = new Funcionario();
        funcionario.nome = nome;
        funcionario.email = email;
        funcionario.cpf = cpf;
        funcionario.cargo = cargo;
        funcionario.salario = salario;
        funcionario.data_contratacao = data_contratacao;
        funcionario.departamento_id = departamento_id;
        funcionario.senha = senha;
        funcionario.usuario_logado = usuario_logado;


        const funcionarioCriado = await funcionario.post_funcionario();


        const objResposta = {
            cod: 1,
            status: funcionarioCriado,
            msg: funcionarioCriado ? 'Funcionário criado com sucesso' : 'Erro ao cadastrar funcionário'
        };
        res.status(200).send(objResposta);
    }


    async controle_funcionario_atualizar(req, res) {
        const id = req.params.id;
        const nome = req.body.nome;
        const email = req.body.email;
        const cpf = req.body.cpf;
        const cargo = req.body.cargo_id;
        const salario = req.body.salario;
        const data_contratacao = req.body.data_contratacao;
        const departamento_id = req.body.departamento_id;
        const senha = req.body.senha;
        const usuario_logado = req.body.usuario_logado;
   
        const funcionario = new Funcionario();
        funcionario._funcionario_id = id;
        funcionario.nome = nome;
        funcionario.email = email;
        funcionario.cpf = cpf;
        funcionario.cargo_id = cargo;
        funcionario.salario = salario;
        funcionario.data_contratacao = data_contratacao;
        funcionario.departamento_id = departamento_id;
        funcionario.senha = senha;
        funcionario.usuario_logado = usuario_logado;
   
        const atualizado = await funcionario.put_funcionario();
   
        const objResposta = {
            cod: 2,
            status: atualizado,
            msg: atualizado ? 'Funcionário atualizado com sucesso' : 'Erro ao atualizar funcionário'
        };
        res.status(200).send(objResposta);
    }
   
   
    async controle_funcionario_deletar(req, res) {
        const id = req.params.id;
        const usuario_logado = req.body.usuario_logado;
   
        const funcionario = new Funcionario();
        funcionario._funcionario_id = id;
        funcionario.usuario_logado = usuario_logado;
   
        const deletado = await funcionario.delete_funcionario();
   
        const objResposta = {
            cod: 3,
            status: deletado,
            msg: deletado ? 'Funcionário deletado com sucesso' : 'Erro ao deletar funcionário'
        };
        res.status(200).send(objResposta);
    }
   


    async controle_funcionario_por_id(req, res) {
        const id = req.params.id;
   
        const funcionario = new Funcionario();
        funcionario._funcionario_id = id;
   
        const resultado = await funcionario.get_funcionario_by_id();
   
        const objResposta = {
            cod: 4,
            status: !!resultado,
            dados: resultado,
            msg: resultado ? 'Funcionário encontrado' : 'Funcionário não encontrado'
        };
        res.status(200).send(objResposta);
    }
   
    async controle_funcionario_todos(req, res) {
        const funcionario = new Funcionario();
   
        const resultado = await funcionario.get_all_funcionarios();
   
        const objResposta = {
            cod: 5,
            status: resultado.length > 0,
            dados: resultado,
            msg: resultado.length > 0 ? 'Funcionários encontrados' : 'Nenhum funcionário encontrado'
        };
        res.status(200).send(objResposta);
    }
    async controle_funcionario_readPage(request, response) {
        const id = parseInt(request.params.id)
        const funcionario = new Funcionario();
        const resultadoFuncionario = await funcionario.readPage(id);


        const objResposta = {
            cod: 1,
            status: true,
            dados: resultadoFuncionario
        };
        response.status(200).send(objResposta);
    }


}
