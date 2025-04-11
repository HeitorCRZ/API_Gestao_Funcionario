const express = require('express');
const ControlLog = require('../control/controlLog');

module.exports = class RouterLog {
    constructor() {
        this._router = express.Router();
        this._controleLog = new ControlLog();
    }

    criarRotasLog() {
        this._router.get('/listar/:id',
            (req, res) => this._controleLog.controle_log_listar(req, res)
        );

        return this._router;
    }
};
