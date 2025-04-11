const express = require('express');
const Supervisor = require("../model/Supervisores");

module.exports = class ControlSupervisor {
    async controle_supervisor_cadastrar(req, res) {
        const supervisor_id = req.body.supervisor_id;
        const supervisionado_id = req.body.supervisionado_id;
        const usuario_logado = req.body.usuario_logado;

        const supervisor = new Supervisor();
        supervisor.supervisor_id = supervisor_id;
        supervisor.supervisionado_id = supervisionado_id;
        supervisor.usuario_logado = usuario_logado;
        const supervisorCriado = await supervisor.post_supervisores();

        const objResposta = {
            cod: 1,
            status: supervisorCriado,
            msg: supervisorCriado ? 'Superior cadastrado com sucesso' : 'Erro ao cadastrar Superior'
        };
        res.status(200).send(objResposta);
    }

    async controle_supervisor_buscar(request, response) {
        const supervisor = new Supervisor();
        const qtdSupervisor = await supervisor.get_qtd_supervisores();
        const qtdSupervisionado = await supervisor.get_qtd_supervisionados();

        const objResposta = {
            cod: 1,
            status: true,
            supervisor: qtdSupervisor,
            supervisionado: qtdSupervisionado
        };
        response.status(200).send(objResposta);
    }
    async controle_supervisor_deletarSupervisor(req, res) {
        try {
          const supervisor = new Supervisor();
          supervisor.supervisor_id = req.params.id;
          supervisor.usuario_logado = req.body.usuario_logado;
      
          const deletado = await supervisor.deletePorSupervisor();
      
          if (deletado) {
            return res.status(200).json({ mensagem: "Todos os vínculos do supervisor foram removidos com sucesso." });
          } else {
            return res.status(404).json({ mensagem: "Nenhum vínculo encontrado com o supervisor fornecido." });
          }
        } catch (error) {
          console.error("Erro ao deletar vínculos do supervisor:", error);
          return res.status(500).json({ mensagem: "Erro interno ao tentar deletar supervisor." });
        }
      }
      async controle_supervisor_deletarSupervisionado(req, res) {
        try {
          const supervisor = new Supervisor();
          supervisor.supervisor_id = req.body.supervisor_id;
          supervisor.supervisionado_id = req.body.supervisionado_id;
          supervisor.usuario_logado = req.body.usuario_logado;
      
          const deletado = await supervisor.deleteVinculoEspecifico();
      
          if (deletado) {
            return res.status(200).json({ mensagem: "Vínculo supervisor-supervisionado removido com sucesso." });
          } else {
            return res.status(404).json({ mensagem: "Vínculo não encontrado com os IDs fornecidos." });
          }
        } catch (error) {
          console.error("Erro ao deletar vínculo específico:", error);
          return res.status(500).json({ mensagem: "Erro interno ao tentar deletar vínculo." });
        }
      }
      
}
