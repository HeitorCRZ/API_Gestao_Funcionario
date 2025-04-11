const Banco = require("./Banco")

module.exports = class HistoricoCargos {

    constructor() {
       this._funcionario_id = null
       this._cargo_anterior = ""
       this._novo_cargo = ""
       this._usuario_logado = null
       this._id = null
    }
    async post_historicoCargo() {
        const conexao = Banco.getConexao();
    
        const sqlInsert = `
            INSERT INTO historico_cargos 
            (funcionario_id, cargo_anterior, novo_cargo, data_alteracao) 
            VALUES (?, ?, ?, now())
        `;
    
        const sqlLog = `
            INSERT INTO log_auditoria 
            (tabela_afetada, id_registro_afetado, campo_modificado, valor_novo, acao, usuario_responsavel)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
    
        try {
            console.log("Dados para histórico:");
            console.log({
                funcionario_id: this._funcionario_id,
                cargo_anterior: this._cargo_anterior,
                novo_cargo: this._novo_cargo
            });
    
            const [result] = await conexao.promise().execute(sqlInsert, [
                this._funcionario_id ?? null,
                this._cargo_anterior ?? null,
                this._novo_cargo ?? null
            ]);
    
            const novoId = result.insertId;
            const usuario = this._usuario_logado;
    
            const logs = [
                ['historico_cargo', novoId, 'funcionario_id', String(this._funcionario_id), 'INSERT', usuario],
                ['historico_cargo', novoId, 'cargo_anterior', this._cargo_anterior, 'INSERT', usuario],
                ['historico_cargo', novoId, 'novo_cargo', this._novo_cargo, 'INSERT', usuario]
            ];
    
            console.log("Logs para auditoria:");
            console.log(logs);
    
            for (const log of logs) {
                await conexao.promise().execute(sqlLog, log);
            }
    
            return result.affectedRows > 0;
    
        } catch (error) {
            console.log("Erro ao inserir histórico de promoção:", error);
            return false;
        }
    }
    
    async get_historicoCargos() {
        const conexao = Banco.getConexao();
    
        const sql = `
            SELECT 
                id,
                funcionario_id,
                cargo_anterior,
                novo_cargo,
                DATE_FORMAT(data_alteracao, '%d/%m/%Y %H:%i:%s') AS data_alteracao
            FROM historico_cargos
            WHERE funcionario_id = ?
            ORDER BY data_alteracao DESC
        `;
    
        try {
            const [rows] = await conexao.promise().execute(sql, [this._funcionario_id]);
            return rows;
        } catch (error) {
            console.log("Erro ao buscar histórico de cargos:", error);
            return [];
        }
    }
    async delete_historicoCargo() {
        const conexao = Banco.getConexao();
    
        // Verifica se o registro existe
        const sqlSelect = `
            SELECT * FROM historico_cargos WHERE id = ?
        `;
    
        const [dados] = await conexao.promise().execute(sqlSelect, [this._id]);
    
        if (dados.length === 0) {
            return false;
        }
    
        const registro = dados[0];
    
        const sqlDelete = `
            DELETE FROM historico_cargos WHERE id = ?
        `;
    
        const sqlLog = `
            INSERT INTO log_auditoria 
            (tabela_afetada, id_registro_afetado, campo_modificado, valor_antigo, acao, usuario_responsavel)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
    
        try {
            const usuario = this.usuario_logado;
    
            const logs = [
                ['historico_cargo', this._id, 'funcionario_id', String(registro.funcionario_id), 'DELETE', usuario],
                ['historico_cargo', this._id, 'cargo_anterior', registro.cargo_anterior, 'DELETE', usuario],
                ['historico_cargo', this._id, 'novo_cargo', registro.novo_cargo, 'DELETE', usuario],
                ['historico_cargo', this._id, 'data_alteracao', registro.data_alteracao, 'DELETE', usuario],
            ];
    
            for (const log of logs) {
                await conexao.promise().execute(sqlLog, log);
            }
    
            const [result] = await conexao.promise().execute(sqlDelete, [this._id]);
            return result.affectedRows > 0;
    
        } catch (error) {
            console.log("Erro ao deletar histórico de cargo:", error);
            return false;
        }
    }
    
    
    get funcionario_id() {
        return this._funcionario_id;
    }
    set funcionario_id(valor) {
        this._funcionario_id = valor;
    }
    
    get cargo_anterior() {
        return this._cargo_anterior;
    }
    set cargo_anterior(valor) {
        this._cargo_anterior = valor;
    }
    
    get novo_cargo() {
        return this._novo_cargo;
    }
    set novo_cargo(valor) {
        this._novo_cargo = valor;
    }
    
    get usuario_logado() {
        return this._usuario_logado;
    }
    set usuario_logado(valor) {
        this._usuario_logado = valor;
    }
    get id() {
        return this._id;
    }
    
    set id(valor) {
        this._id = valor;
    }
    
    
}
