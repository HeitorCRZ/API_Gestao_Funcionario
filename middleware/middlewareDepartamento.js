const Departamento = require("../model/Departamentos");
const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const multer = require('multer');
const TokenJWT = require("../model/meuTokenJWT");

const upload = multer({ dest: 'uploads/' });

module.exports = class MiddlewareDepartamento {


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
              const dadosJson = JSON.parse(conteudo);
              req.body = {
                departamentos: Array.isArray(dadosJson)
                  ? dadosJson
                  : dadosJson.departamentos
              };
            } else if (ext === '.csv') {
              const registros = parse(conteudo, {
                columns: true,
                skip_empty_lines: true,
                trim: true,
                delimiter: ';' // IMPORTANTE!
              });
              req.body = { departamentos: registros };
            } else {
              return res.status(400).json({ msg: 'Formato de arquivo não suportado (apenas .json ou .csv)' });
            }
          }

          if (!req.body || !req.body.departamentos || !Array.isArray(req.body.departamentos)) {
            return res.status(400).json({ msg: 'Nenhum dado de Departamento foi fornecido' });
          }

          console.log("Dados recebidos:", req.body.departamentos);
          next();

        } catch (err) {
          console.error(err);
          return res.status(500).json({ msg: 'Erro ao processar o arquivo ou JSON/CSV', erro: err.message });
        }
      }
    ];
  }


  validar_autenticacao = async (req, res, next) => {
    const objToken = new TokenJWT()
    const headers = req.headers['authorization']; // certo: tudo minúsculo
    if (objToken.validarToken(headers) == true) {
      next();
      return
    }
    return res.status(400).json({
      msg: "Token Invalido",
      status: false
    });
  }
  normalizarDepartamentos = (body) => {
    if (Array.isArray(body.departamentos)) {
      return body.departamentos;
    } else if (body.departamentos) {
      return [body.departamentos];
    } else {
      return [body];
    }
  }

  processarCSV = (req, res, next) => {
    if (!req.file) return next();

    try {
      const filePath = req.file.path;
      const ext = path.extname(req.file.originalname).toLowerCase();
      if (ext !== '.csv') {
        fs.unlinkSync(filePath);
        return res.status(400).json({
          status: false,
          msg: "O arquivo enviado não é um CSV válido. Envie um arquivo com extensão .csv."
        });
      }

      const csvContent = fs.readFileSync(filePath, 'utf8');
      const registros = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });

      if (!registros || registros.length === 0) {
        fs.unlinkSync(filePath);
        return res.status(400).json({
          status: false,
          msg: "O arquivo CSV está vazio ou não contém dados válidos."
        });
      }

      const camposObrigatorios = ['nome', 'orcamento', 'localizacao', 'data_criacao'];

      for (let i = 0; i < registros.length; i++) {
        const linha = registros[i];
        for (const campo of camposObrigatorios) {
          if (!linha[campo] || linha[campo].toString().trim() === "") {
            fs.unlinkSync(filePath);
            return res.status(400).json({
              status: false,
              msg: `O campo obrigatório '${campo}' está ausente ou vazio na linha ${i + 1} do CSV.`
            });
          }
        }
      }

      req.body = { departamentos: registros };
      fs.unlinkSync(filePath);
      next();
    } catch (err) {
      console.error("Erro ao processar CSV:", err);
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(500).json({
        status: false,
        msg: "Erro ao processar o arquivo CSV. Verifique se ele está corretamente formatado e contém todos os campos necessários."
      });
    }
  };

  validarIdDepartamento = async (req, res, next) => {
    const id = req.params.id;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        cod: 1,
        status: false,
        msg: "O id é obrigatório e deve ser um número válido."
      });
    }

    try {
      const departamento = new Departamento();
      const existe = await departamento.validarId(id);

      if (!existe) {
        return res.status(404).json({
          cod: 2,
          status: false,
          msg: `O id ${id} de departamento não existe no banco de dados.`
        });
      }

      next();
    } catch (error) {
      console.error("Erro ao verificar departamento_id:", error);
      return res.status(500).json({
        cod: 3,
        status: false,
        msg: "Erro interno ao verificar o departamento_id."
      });
    }
  }

  validarCep = async (req, res, next) => {
    const departamentos = this.normalizarDepartamentos(req.body);
    try {
      for (let i = 0; i < departamentos.length; i++) {
        let cep = departamentos[i].localizacao;
        cep = cep.replace(/\D/g, ''); // remove tudo que não for número

        const resposta = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);

        if (resposta.data.erro) {
          return res.status(400).json({
            cod: 1,
            status: false,
            msg: `O CEP do departamento ${i + 1} é inválido.`,
          });
        }
      }
      return next();
    } catch (erro) {
      return res.status(500).json({ erro: "Erro ao consultar o CEP" });
    }
  }


  validarNome = (req, res, next) => {
    const departamentos = this.normalizarDepartamentos(req.body);
    for (let i = 0; i < departamentos.length; i++) {
      const nome = departamentos[i].nome;
      if (!nome || nome.length < 2) {
        return res.status(400).json({
          cod: 1,
          status: false,
          msg: `O nome do Departamento ${i + 1} é inválido ou muito curto.`,
        });
      }
    }
    next();
  }

  validarOrcamento = (req, res, next) => {
    const departamentos = this.normalizarDepartamentos(req.body);
    for (let i = 0; i < departamentos.length; i++) {
      const orcamento = departamentos[i].orcamento;
      if (orcamento === undefined || isNaN(orcamento) || parseFloat(orcamento) <= 0) {
        return res.status(400).json({
          cod: 5,
          status: false,
          msg: `O orçamento do departamento ${i + 1} é inválido.`
        });
      }
    }
    next();
  }

  validarDataCriacao = (req, res, next) => {
    const departamentos = this.normalizarDepartamentos(req.body);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    for (let i = 0; i < departamentos.length; i++) {
      const data = new Date(departamentos[i].data_criacao);
      if (!departamentos[i].data_criacao || isNaN(data.getTime()) || data > hoje) {
        return res.status(400).json({
          cod: 6,
          status: false,
          msg: `A data de criação do departamento ${i + 1} é inválida ou está no futuro.`,
        });
      }
    }
    next();
  }

  verificarDepartamentoCadastrado = async (req, res, next) => {
    const departamentos = this.normalizarDepartamentos(req.body);
    for (let i = 0; i < departamentos.length; i++) {
      const nome = departamentos[i].nome;
      const departamento = new Departamento();
      departamento.nome = nome;
      const existe = await departamento.verificarDepartamento();
      if (existe) {
        return res.status(400).json({
          msg: "Este Departamento já está cadastrado",
          status: false
        });
      }
    }
    next();
  }
}
