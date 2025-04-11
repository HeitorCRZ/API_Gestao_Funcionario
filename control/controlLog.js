const express = require('express');
const Logs = require("../model/Logs");

module.exports = class ControlLogs {
    async controle_log_listar(request, response) {
        const id = parseInt(request.params.id)
        const log = new Logs();
        const resultado = await log.readPageLogs(id);

        const objResposta = {
            cod: 1,
            status: true,
            dados: resultado
        };
        response.status(200).send(objResposta);
    }

}
