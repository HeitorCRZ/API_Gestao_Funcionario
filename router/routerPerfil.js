const express = require('express');
const ControlPerfil = require('../control/controlPerfil');
const MiddlewarePerfil = require('../middleware/middlewarePerfil');
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/fotos/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.jpg', '.jpeg', '.png'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de arquivo não permitido. Apenas JPG, JPEG e PNG são aceitos.'), false);
        }
    }
});


module.exports = class RouterPerfil {
    constructor() {
        this._router = express.Router();
        this._controlePerfil = new ControlPerfil();
        this._middlewarePerfil = new MiddlewarePerfil();
    }

    criarRotasPerfil() {
        this._router.post('/cadastrar',
            upload.single("arquivo"),
            this._middlewarePerfil.verificarFoto,
            this._middlewarePerfil.validarIdade,
            this._middlewarePerfil.validarTelefone,
            this._middlewarePerfil.validarCep,
            this._controlePerfil.controle_perfil_cadastrar
        );

        this._router.put('/atualizar/:id',
            this._middlewarePerfil.validarIdade,
            this._middlewarePerfil.validarTelefone,
            this._middlewarePerfil.validarCep,
            this._controlePerfil.controle_perfil_atualizar
        );

        this._router.get('/buscar/:id',
            this._controlePerfil.controle_perfil_buscar
        );

        return this._router;
    }
};
