const Banco = require("./Banco");

module.exports = class Perfis {
    constructor() {
        this._id = null;
        this._idade = null;
        this._endereco = "";
        this._telefone = "";
        this._genero = "";
        this._estado_civil = "";
        this._usuario_logado = "";
        this._imagem = "";
    }

    async post_perfil() {
        const conexao = Banco.getConexao();
        const sql = "INSERT INTO perfis (funcionario_id, idade, endereco, telefone, genero, estado_civil, imagem) VALUES (?, ?, ?, ?, ?, ?, ?)";

        try {
            const [result] = await conexao.promise().execute(sql, [
                this.usuario_logado,
                this.idade,
                this.endereco,
                this.telefone,
                this.genero,
                this.estado_civil,
                this.imagem
            ]);

            this._id = result.insertId;

            const sqlLog = `
                INSERT INTO log_auditoria 
                (tabela_afetada, id_registro_afetado, campo_modificado, valor_novo, acao, usuario_responsavel)
                VALUES (?, ?, ?, ?, ?, ?)
            `;

            const usuario = this.usuario_logado;

            const logs = [
                ['perfis', usuario, 'idade', String(this.idade), 'INSERT', usuario],
                ['perfis', usuario, 'endereco', this.endereco, 'INSERT', usuario],
                ['perfis', usuario, 'telefone', this.telefone, 'INSERT', usuario],
                ['perfis', usuario, 'genero', this.genero, 'INSERT', usuario],
                ['perfis', usuario, 'estado_civil', this.estado_civil, 'INSERT', usuario],
                ['perfis', usuario, 'imagem', this.imagem, 'INSERT', usuario]
            ];

            for (const log of logs) {
                await conexao.promise().execute(sqlLog, log);
            }

            return result.affectedRows > 0;
        } catch (error) {
            console.log("Erro >>>", error);
            return false;
        }
    }

    async get_perfil_by_id() {
        const conexao = Banco.getConexao();
        const sql = "SELECT * FROM perfis WHERE funcionario_id = ?";

        try {
            const [result] = await conexao.promise().execute(sql, [this.funcionario_id]);
            return result.length === 1 ? result : false;
        } catch (error) {
            console.log("Erro ao buscar perfil por ID >>>", error);
            return false;
        }
    }

    async put_perfil() {
        const conexao = Banco.getConexao();
        const perfilAtual = await this.validarId(this.usuario_logado);
        if (!perfilAtual) return false;

        this._id = perfilAtual.id;
        const atual = perfilAtual;

        const sql = `
            UPDATE perfis 
            SET idade = ?, endereco = ?, telefone = ?, genero = ?, estado_civil = ?
            WHERE id = ?
        `;

        try {
            const [result] = await conexao.promise().execute(sql, [
                this.idade,
                this.endereco,
                this.telefone,
                this.genero,
                this.estado_civil,
                this._id
            ]);

            const sqlLog = `
                INSERT INTO log_auditoria 
                (tabela_afetada, id_registro_afetado, campo_modificado, valor_novo, valor_antigo, acao, usuario_responsavel)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            const usuario = this.usuario_logado;

            const logs = [
                ['perfis', usuario, 'idade', String(this.idade), String(atual.idade), 'UPDATE', usuario],
                ['perfis', usuario, 'endereco', this.endereco, String(atual.endereco), 'UPDATE', usuario],
                ['perfis', usuario, 'telefone', this.telefone, String(atual.telefone), 'UPDATE', usuario],
                ['perfis', usuario, 'genero', this.genero, String(atual.genero), 'UPDATE', usuario],
                ['perfis', usuario, 'estado_civil', this.estado_civil, String(atual.estado_civil), 'UPDATE', usuario]
            ];

            for (const log of logs) {
                if (log[3] !== log[4]) {
                    await conexao.promise().execute(sqlLog, log);
                }
            }

            return result.affectedRows > 0;
        } catch (error) {
            console.log("Erro ao atualizar perfil:", error);
            return false;
        }
    }

    async validarId(id) {
        const conexao = Banco.getConexao();
        try {
            const [rows] = await conexao.promise().execute(
                "SELECT * FROM perfis WHERE funcionario_id = ?",
                [id]
            );
            return rows.length > 0 ? rows[0] : false;
        } catch (error) {
            console.error("Erro ao validar ID do perfil:", error);
            return false;
        }
    }

    async get_perfil_by_usuario_logado() {
        const conexao = Banco.getConexao();
        const sql = 'SELECT * FROM perfis WHERE funcionario_id = ?';

        try {
            const [rows] = await conexao.promise().execute(sql, [this.usuario_logado]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            throw new Error('Erro ao buscar perfil pelo funcionário_id: ' + error.message);
        }
    }

    // Getters e setters
    get idade() {
        return this._idade;
    }
    set idade(valor) {
        this._idade = valor;
    }

    get imagem() {
        return this._imagem;
    }
    set imagem(valor) {
        this._imagem = valor;
    }

    get endereco() {
        return this._endereco;
    }
    set endereco(valor) {
        this._endereco = valor;
    }

    get telefone() {
        return this._telefone;
    }
    set telefone(valor) {
        this._telefone = valor;
    }

    get genero() {
        return this._genero;
    }
    set genero(valor) {
        this._genero = valor;
    }

    get estado_civil() {
        return this._estado_civil;
    }
    set estado_civil(valor) {
        this._estado_civil = valor;
    }

    get id() {
        return this._id;
    }
    set id(valor) {
        this._id = valor;
    }

    get usuario_logado() {
        return this._usuario_logado;
    }
    set usuario_logado(valor) {
        this._usuario_logado = valor;
    }
};
