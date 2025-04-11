const Supervisor = require("../model/HistoricoCargos");
const express = require('express');


module.exports = class MiddlewareHistoricoCargo {


    validarCargos(req, res, next) {
        const novo_cargo = req.body.novo_cargo;
        const cargo_anterior = req.body.cargo_anterior;
    
        if (
            typeof cargo_anterior !== 'string' || 
            typeof novo_cargo !== 'string' ||
            !cargo_anterior.trim() || 
            !novo_cargo.trim()
        ) {
            return res.status(400).json({ erro: 'Cargos devem ser strings válidas e não vazias.' });
        }
    
        if (cargo_anterior.trim().toLowerCase() === novo_cargo.trim().toLowerCase()) {
            return res.status(400).json({ erro: 'O novo cargo deve ser diferente do cargo anterior.' });
        }
    
        next();
    }
    

}
