const Funcionario = require("../model/Funcionarios");
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const upload = multer({ dest: 'uploads/' });

module.exports = class MiddlewareFuncionario {

  constructor() {
    this.uploadJSON = [
      upload.single('arquivo'),
      async (req, res, next) => {
        try {
          if (req.file) {
            const ext = path.extname(req.file.originalname).toLowerCase();
            const caminhoCompleto = path.resolve(req.file.path);
            const conteudo = await fs.promises.readFile(caminhoCompleto, 'utf8');
            if (ext === '.json') {
              req.body = JSON.parse(conteudo);
            } else if (ext === '.csv') {
              const registros = parse(conteudo, { columns: true, skip_empty_lines: true, trim: true });
              req.body = { funcionarios: registros };
            } else
              return res.status(400).json({ msg: 'Formato de arquivo não suportado (apenas .json ou .csv)' });
          }

          if (!req.body || (!req.body.funcionarios && Object.keys(req.body).length === 0))
            return res.status(400).json({ msg: 'Nenhum dado de funcionário foi fornecido' });

          next();
        } catch (err) {
          console.error(err);
          return res.status(500).json({ msg: 'Erro ao processar o arquivo ou JSON/CSV', erro: err.message });
        }
      }
    ];
  }

  validarNome = (req, res, next) => {
    const funcionarios = this.normalizarFuncionarios(req.body);
    for (let i = 0; i < funcionarios.length; i++) {
      const nome = funcionarios[i].nome;
      if (!nome || nome.length < 3) {
        return res.status(400).json({
          cod: 1,
          status: false,
          msg: `O nome do funcionário ${i + 1} é inválido ou muito curto.`,
        });
      }
    }
    next();
  }
  validarSenha = (req, res, next) => {
    const funcionarios = this.normalizarFuncionarios(req.body);
    for (let i = 0; i < funcionarios.length; i++) {
      const senha = funcionarios[i].senha;
      if (!senha || senha.length < 3) {
        return res.status(400).json({
          cod: 1,
          status: false,
          msg: `A senha do funcionário ${i + 1} é inválido ou muito curto.`,
        });
      }
    }
    next();
  }

  normalizarFuncionarios = (body) => {
    if (Array.isArray(body.funcionarios)) {
      return body.funcionarios;
    } else if (body.funcionarios) {
      return [body.funcionarios];
    } else {
      return [body];
    }
  }

  validarSalario = (req, res, next) => {
    const funcionarios = this.normalizarFuncionarios(req.body);
    for (let i = 0; i < funcionarios.length; i++) {
      const salario = funcionarios[i].salario;
      if (salario === undefined || isNaN(salario) || parseFloat(salario) <= 0) {
        return res.status(400).json({
          cod: 5,
          status: false,
          msg: `O salário do funcionário ${i + 1} é inválido.`
        });
      }
    }
    next();
  }

  verificarEmailCadastrado = async (req, res, next) => {
    const funcionarios = this.normalizarFuncionarios(req.body);
    for (let i = 0; i < funcionarios.length; i++) {
      const email = funcionarios[i].email;
      const funcionario = new Funcionario();
      funcionario.email = email;
      const existe = await funcionario.verificarEmail();
      if (existe) {
        return res.status(400).json({
          msg: "Este email de funcionário já está cadastrado",
          status: false
        });
      }
    }
    next();
  }

  async verificarFuncionarioExistente(req, res, next) {
    try {
      const email = req.body.email;
      const senha = req.body.senha;
      const objFuncionario = new Funcionario();
      objFuncionario.email = email;
      objFuncionario.senha = senha;
      const funcionarioExistente = await objFuncionario.get_Funcionario();
      if (!funcionarioExistente) {
        return res.status(404).json({
          error: 'Funcionario não encontrado.',
          status: false
        });
      } else {
        req.funcionario = objFuncionario;
        next();
      }
    } catch (error) {
      console.error('Erro ao verificar Funcionario:', error);
      res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  validarDepartamento_id = async (req, res, next) => {
    const funcionarios = this.normalizarFuncionarios(req.body);
    for (let i = 0; i < funcionarios.length; i++) {
      const depId = funcionarios[i].departamento_id; // corrigido nome do campo
      if (isNaN(depId) || depId <= 0) {
        return res.status(400).json({
          cod: 7,
          status: false,
          msg: `Departamento ID inválido no funcionário ${i + 1}`
        });
      }
      try {
        const funcionario = new Funcionario();
        funcionario.departamento_id = depId;

        const existe = await funcionario.verificarDepartamento();

        if (!existe) {
          return res.status(404).json({
            cod: 2,
            status: false,
            msg: `O id ${depId} de departamento não existe no banco de dados.`
          });
        }

        next();
      } catch (error) {
        console.error("Erro ao verificar cargo_id:", error);
        return res.status(500).json({
          cod: 3,
          status: false,
          msg: "Erro interno ao verificar o cargo_id."
        });
      }
    }
  }


  validarCargo = (req, res, next) => {
    const funcionarios = this.normalizarFuncionarios(req.body);

    for (let i = 0; i < funcionarios.length; i++) {
      const cargoNome = funcionarios[i].cargo;

      if (!cargoNome || typeof cargoNome !== 'string' || !cargoNome.trim()) {
        return res.status(400).json({
          cod: 1,
          status: false,
          msg: "O campo 'cargo' é obrigatório e deve ser uma string válida."
        });
      }
      next();
    };
  }

  validarIdFuncionario = async (req, res, next) => {

    const id = req.params.id;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        cod: 1,
        status: false,
        msg: "O id é obrigatório e deve ser um número válido."
      });
    }

    try {
      const funcionario = new Funcionario();

      const existe = await funcionario.validarId(id);

      if (!existe) {
        return res.status(404).json({
          cod: 2,
          status: false,
          msg: `O id ${id} de funcionario não existe no banco de dados.`
        });
      }

      next();
    } catch (error) {
      console.error("Erro ao verificar cargo_id:", error);
      return res.status(500).json({
        cod: 3,
        status: false,
        msg: "Erro interno ao verificar o cargo_id."
      });
    }
  }


  validarEmail = (req, res, next) => {
    const funcionarios = this.normalizarFuncionarios(req.body);
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (let i = 0; i < funcionarios.length; i++) {
      const email = funcionarios[i].email;
      if (!email || !regexEmail.test(email)) {
        return res.status(400).json({
          cod: 2,
          status: false,
          msg: `O e-mail do funcionário ${i + 1} é inválido.`,
        });
      }
    }
    next();
  }

  validarCPF = (req, res, next) => {
    const funcionarios = this.normalizarFuncionarios(req.body);
    const regexCPF = /^\d{3}\.\d{3}\.\d{3}\-\d{2}$/;
    for (let i = 0; i < funcionarios.length; i++) {
      const cpf = funcionarios[i].cpf;
      if (!cpf || !regexCPF.test(cpf)) {
        return res.status(400).json({
          cod: 3,
          status: false,
          msg: `O CPF do funcionário ${i + 1} é inválido. Use o formato: 000.000.000-00`,
        });
      }
    }
    next();
  }

  validarDadosFuncionario(req, res, next) {
    const email = req.body.email;
    const senha = req.body.senha;
    if (!email || !senha) {
      return res.status(400).json({
        error: 'Preencha todos os campos!',
        status: false
      });
    }
    next();
  }

  validarDataContratacao = (req, res, next) => {
    const funcionarios = this.normalizarFuncionarios(req.body);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    for (let i = 0; i < funcionarios.length; i++) {
      const data = new Date(funcionarios[i].data_contratacao);
      if (!funcionarios[i].data_contratacao || isNaN(data.getTime()) || data > hoje) {
        return res.status(400).json({
          cod: 6,
          status: false,
          msg: `A data de contratação do funcionário ${i + 1} é inválida ou está no futuro.`,
        });
      }
    }
    next();
  }
}