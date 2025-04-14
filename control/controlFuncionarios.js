const express = require('express');
const Funcionario = require("../model/Funcionarios");
const fs = require('fs');
const MeuTokenJWT = require("../model/MeuTokenJWT")
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
                id: objFuncionario.id_funcionario,
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
            const lista = request.body.funcionarios;
            if (!Array.isArray(lista)) {
                return response.status(400).json({ msg: 'Dados de funcionários inválidos' });
            }

            const funcionariosCriados = [];
            const funcionariosDuplicados = [];
            const usuario_logado = request.params.id;

            for (const dados of lista) {
                try {
                    const funcionario = new Funcionario();
                    funcionario._usuario_logado = usuario_logado;
                    funcionario.nome = dados.nome;
                    funcionario.email = dados.email;
                    funcionario.senha = dados.senha;
                    funcionario.cpf = dados.cpf;
                    funcionario.cargo = dados.cargo;
                    funcionario.salario = dados.salario;
                    funcionario.data_contratacao = dados.data_contratacao;
                    funcionario.departamento_id = dados.departamento_id;

                    const existe = await funcionario.verificarEmail();

                    if (!existe) {
                        const criado = await funcionario.post_funcionario();
                        if (criado) funcionariosCriados.push(funcionario);
                    } else {
                        funcionariosDuplicados.push(dados.nome || dados.email);
                    }
                } catch (erroInterno) {
                    console.error("Erro ao processar funcionário:", dados.nome || dados.email, erroInterno);
                    // Você pode logar ou salvar quem falhou também, se quiser
                }
            }

            return response.status(200).json({
                message: 'Funcionários processados com sucesso!',
                processados: funcionariosCriados.length,
                duplicados: funcionariosDuplicados.length,
                nomes_duplicados: funcionariosDuplicados
            });

        } catch (error) {
            console.error("Erro ao processar CSV:", error);
            if (!response.headersSent) {
                return response.status(500).json({ error: 'Erro interno do servidor!' });
            }
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

    async controle_funcionario_dadosRelatorio(req, res) {
        try {
            const funcionario = new Funcionario();

            const totalFuncionarios = await funcionario.totalFuncionariosAtivos();
            const funcionariosCargo = await funcionario.funcionariosPorCargo();
            const proporcaoGenero = await funcionario.proporcaoGenero();
            const mediaSalarial = await funcionario.mediaSalarialGeral();
            const distribuicaoSalarial = await funcionario.distribuicaoSalarialPorDepartamento();
            const idadePorDepartamento = await funcionario.idadeMediaPorDepartamento();

            const objResposta = {
                cod: 7,
                status: true,
                relatorio: {
                    total_funcionarios: totalFuncionarios,
                    funcionarios_por_cargo: funcionariosCargo,
                    proporcao_genero: proporcaoGenero,
                    media_salarial_geral: mediaSalarial,
                    distribuicao_salarial_departamento: distribuicaoSalarial,
                    idade_media_departamento: idadePorDepartamento
                },
                msg: "Relatório estatístico de funcionários gerado com sucesso."
            };

            res.status(200).send(objResposta);
        } catch (error) {
            console.error("Erro ao gerar relatório:", error);
            res.status(500).send({
                cod: 0,
                status: false,
                msg: "Erro ao gerar relatório de funcionários."
            });
        }
    }



    async controle_funcionario_atualizar(req, res) {
        const id = req.params.id;
        const nome = req.body.nome;
        const cpf = req.body.cpf;
        const cargo = req.body.cargo;
        const salario = req.body.salario;
        const data_contratacao = req.body.data_contratacao;
        const departamento_id = req.body.departamento_id;
        const usuario_logado = req.body.usuario_logado;

        const funcionario = new Funcionario();
        funcionario._funcionario_id = id;
        funcionario.nome = nome;
        funcionario.cpf = cpf;
        funcionario.cargo = cargo;
        funcionario.salario = salario;
        funcionario.data_contratacao = data_contratacao;
        funcionario.departamento_id = departamento_id;
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
        const usuario_logado = req.query.usuario_logado; // <-- alterado aqui

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
