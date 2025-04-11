const Banco = require("./Banco")

module.exports = class Supervisores {

    constructor() {
        this._supervisor_id = null
        this._supervisionado_id = null
        this._usuario_logado = null
    }
    async post_supervisores() {
        const conexao = Banco.getConexao();
        const sql = "INSERT INTO supervisores (supervisor_id, supervisionado_id) VALUES (?, ?)";

        try {
            const [result] = await conexao.promise().execute(sql, [this._supervisor_id, this._supervisionado_id]);
            this._id = result.insertId;

            const sqlLog = `
                INSERT INTO log_auditoria 
                (tabela_afetada, id_registro_afetado, campo_modificado, valor_novo, acao, usuario_responsavel)
                VALUES (?, ?, ?, ?, ?, ?)
            `;

            const usuario = this.usuario_logado;
            const id = this._id;

            const logs = [
                ['supervisores', id, 'supervisor_id', String(this._supervisor_id), 'INSERT', usuario],
                ['supervisores', id, 'supervisionado_id', String(this._supervisionado_id), 'INSERT', usuario]
            ];

            for (const log of logs) {
                if (log[3] !== log[4]) {
                    await conexao.promise().execute(sqlLog, log);
                }
            }

            return result.affectedRows > 0;
        } catch (error) {
            console.log("Erro >>>", error);
            return false;
        }
    }

    async get_supervisor_especifico() {
        const conexao = Banco.getConexao();
        const sql = "SELECT * FROM supervisores WHERE supervisor_id = ? AND supervisionado_id = ?";

        try {
            const [rows] = await conexao.promise().execute(sql, [this._supervisor_id, this._supervisionado_id]);
            return rows.length > 0;
        } catch (error) {
            console.log("Erro >>>", error);
            return [];
        }
    }
    async get_supervisores_mesmo_id() {
        const conexao = Banco.getConexao();
        const sql = "SELECT * FROM supervisores WHERE supervisor_id = ?";

        try {
            const [rows] = await conexao.promise().execute(sql, [this._supervisionado_id]);
            return rows.length > 0;
        } catch (error) {
            console.log("Erro >>>", error);
            return false;
        }
    }

    async get_qtd_supervisores() {
        const conexao = Banco.getConexao();
        const sql = "SELECT COUNT(DISTINCT supervisor_id) AS qtd_supervisores FROM supervisores";

        try {
            const [rows] = await conexao.promise().execute(sql);
            return rows[0].qtd_supervisores;
        } catch (error) {
            console.log("Erro >>>", error);
            return 0;
        }
    }
    async get_qtd_supervisionados() {
        const conexao = Banco.getConexao();
        const sql = "SELECT COUNT(DISTINCT supervisionado_id) AS qtd_supervisionados FROM supervisores";

        try {
            const [rows] = await conexao.promise().execute(sql);
            return rows[0].qtd_supervisionados;
        } catch (error) {
            console.log("Erro >>>", error);
            return 0;
        }
    }
    async verificar_ids_funcionarios() {
        const conexao = Banco.getConexao();
        const sql = `
            SELECT id FROM funcionarios 
            WHERE id = ? OR id = ?
        `;

        try {
            const [rows] = await conexao.promise().execute(sql, [this._supervisor_id, this._supervisionado_id]);
            const idsEncontrados = rows.map(row => row.id);

            const supervisorExiste = idsEncontrados.includes(this._supervisor_id);
            const supervisionadoExiste = idsEncontrados.includes(this._supervisionado_id);

            if (!supervisorExiste && !supervisionadoExiste) {
                return { sucesso: false, mensagem: "Supervisor e supervisionado não encontrados" };
            } else if (!supervisorExiste) {
                return { sucesso: false, mensagem: "Supervisor não encontrado" };
            } else if (!supervisionadoExiste) {
                return { sucesso: false, mensagem: "Supervisionado não encontrado" };
            }

            return { sucesso: true };
        } catch (error) {
            console.log("Erro >>>", error);
            return { sucesso: false, mensagem: "Erro ao verificar IDs dos funcionários" };
        }
    }

    async deletePorSupervisor() {
        const conexao = Banco.getConexao();

        const sqlSelect = "SELECT * FROM supervisores WHERE supervisor_id = ?";
        const sqlDelete = "DELETE FROM supervisores WHERE supervisor_id = ?";
        const sqlLog = `
          INSERT INTO log_auditoria 
          (tabela_afetada, id_registro_afetado, campo_modificado, valor_antigo, acao, usuario_responsavel)
          VALUES (?, ?, ?, ?, ?, ?)
        `;

        try {
            const [supervisores] = await conexao.promise().execute(sqlSelect, [this._supervisor_id]);

            if (supervisores.length === 0) return false;

            const usuario = this.usuario_logado;

            for (const supervisor of supervisores) {
                const logs = [
                    ['supervisores', supervisor.id, 'supervisor_id', String(supervisor.supervisor_id), 'DELETE', usuario],
                    ['supervisores', supervisor.id, 'supervisionado_id', String(supervisor.supervisionado_id), 'DELETE', usuario]
                ];

                for (const log of logs) {
                    if (log[3] !== log[4]) {
                        await conexao.promise().execute(sqlLog, log);
                    }
                }
            }

            const [result] = await conexao.promise().execute(sqlDelete, [this._supervisor_id]);
            return result.affectedRows > 0;

        } catch (error) {
            console.log("Erro ao deletar por supervisor_id:", error);
            return false;
        }
    }
    
    async deleteVinculoEspecifico() {
        const conexao = Banco.getConexao();

        const sqlSelect = "SELECT * FROM supervisores WHERE supervisor_id = ? AND supervisionado_id = ?";
        const sqlDelete = "DELETE FROM supervisores WHERE supervisor_id = ? AND supervisionado_id = ?";
        const sqlLog = `
          INSERT INTO log_auditoria 
          (tabela_afetada, id_registro_afetado, campo_modificado, valor_antigo, acao, usuario_responsavel)
          VALUES (?, ?, ?, ?, ?, ?)
        `;

        try {
            const [rows] = await conexao.promise().execute(sqlSelect, [this._supervisor_id, this._supervisionado_id]);

            if (rows.length === 0) return false;

            const atual = rows[0];
            const usuario = this.usuario_logado;

            const logs = [
                ['supervisores', atual.id, 'supervisor_id', String(atual.supervisor_id), 'DELETE', usuario],
                ['supervisores', atual.id, 'supervisionado_id', String(atual.supervisionado_id), 'DELETE', usuario]
            ];

            for (const log of logs) {
                if (log[3] !== log[4]) {
                    await conexao.promise().execute(sqlLog, log);
                }
            }

            const [result] = await conexao.promise().execute(sqlDelete, [this._supervisor_id, this._supervisionado_id]);
            return result.affectedRows > 0;

        } catch (error) {
            console.log("Erro ao deletar vínculo específico:", error);
            return false;
        }
    }


    get supervisor_id() {
        return this._supervisor_id
    }

    set supervisor_id(value) {
        this._supervisor_id = value
    }

    get supervisionado_id() {
        return this._supervisionado_id
    }

    set supervisionado_id(value) {
        this._supervisionado_id = value
    }
    get usuario_logado() {
        return this._usuario_logado;
    }

    set usuario_logado(value) {
        this._usuario_logado = value;
    }
}
