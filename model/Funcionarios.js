const Banco = require("./Banco")
const crypto = require('crypto');


module.exports = class Funcionario {


    constructor() {
        this.email = ""
        this._nome = ""
        this._senha = ""
        this._cpf = ""
        this._salario = null
        this._departamento_id = null
        this._data_contratacao = null
        this._cargo = null
        this.usuario_logado = ""
        this._funcionario_id = null
    }
    async post_funcionario() {
        const conexao = Banco.getConexao();
        const sql = "INSERT INTO funcionarios (nome, email, senha, cpf, cargo, salario, data_contratacao, departamento_id) VALUES (?, ?, md5(?), ?, ?, ?, ?, ?)";
        try {
            const [result] = await conexao.promise().execute(sql, [
                this.nome,
                this.email,
                this.senha,
                this.cpf,
                this.cargo,
                this.salario,
                this.data_contratacao,
                this.departamento_id
            ]);


            this._funcionario_id = result.insertId;


            // Auditoria
            const sqlLog = `
                INSERT INTO log_auditoria
                (tabela_afetada, id_registro_afetado, campo_modificado, valor_novo, acao, usuario_responsavel)
                VALUES (?, ?, ?, ?, ?, ?)
            `;


            // Aqui está o usuário do sistema de login
            const usuario = this.usuario_logado;
            const id = this._funcionario_id;
            const senhaCriptografada = crypto.createHash('md5').update(this.senha).digest('hex');


            const logs = [
                ['funcionarios', id, 'nome', this.nome, 'INSERT', usuario],
                ['funcionarios', id, 'email', this.email, 'INSERT', usuario],
                ['funcionarios', id, 'senha', senhaCriptografada, 'INSERT', usuario],
                ['funcionarios', id, 'cpf', this.cpf, 'INSERT', usuario],
                ['funcionarios', id, 'cargo', String(this.cargo), 'INSERT', usuario],
                ['funcionarios', id, 'salario', String(this.salario), 'INSERT', usuario],
                ['funcionarios', id, 'data_contratacao', this.data_contratacao, 'INSERT', usuario],
                ['funcionarios', id, 'departamento_id', String(this.departamento_id), 'INSERT', usuario],
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


    async put_funcionario() {


        const conexao = Banco.getConexao();
        const funcionarioExistente = await this.validarId(this._funcionario_id);


        if (!funcionarioExistente) {
            return false;
        }


        const atual = funcionarioExistente;


        const sql = `
            UPDATE funcionarios
            SET nome = ?, cpf = ?, cargo = ?, salario = ?, data_contratacao = ?, departamento_id = ?
            WHERE id = ?
        `;


        try {
            const [result] = await conexao.promise().execute(sql, [
                this.nome,
                this.cpf,
                this.cargo,
                this.salario,
                this.data_contratacao,
                this.departamento_id,
                this._funcionario_id
            ]);


            const usuario = this.usuario_logado;
            const senhaCriptografada = crypto.createHash('md5').update(String(this.senha)).digest('hex');


            const sqlLog = `
                INSERT INTO log_auditoria
                (tabela_afetada, id_registro_afetado, campo_modificado, valor_novo, valor_antigo, acao, usuario_responsavel)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;


            const logs = [
                ['funcionarios', this._funcionario_id, 'nome', this.nome, String(atual.nome), 'UPDATE', usuario],
                ['funcionarios', this._funcionario_id, 'email', this.email, String(atual.email), 'UPDATE', usuario],
                ['funcionarios', this._funcionario_id, 'senha', senhaCriptografada, String(atual.senha), 'UPDATE', usuario],
                ['funcionarios', this._funcionario_id, 'cpf', this.cpf, String(atual.cpf), 'UPDATE', usuario],
                ['funcionarios', this._funcionario_id, 'cargo_id', String(this.cargo), String(atual.cargo), 'UPDATE', usuario],
                ['funcionarios', this._funcionario_id, 'salario', String(this.salario), String(atual.salario), 'UPDATE', usuario],
                ['funcionarios', this._funcionario_id, 'data_contratacao', this.data_contratacao, atual.data_contratacao, 'UPDATE', usuario],
                ['funcionarios', this._funcionario_id, 'departamento_id', String(this.departamento_id), String(atual.departamento_id), 'UPDATE', usuario]
            ];


            for (const log of logs) {
                if (log[3] !== log[4]) {
                    await conexao.promise().execute(sqlLog, log);
                }
            }






            return result.affectedRows > 0;
        } catch (error) {
            console.log("Erro ao atualizar funcionário:", error);
            return false;
        }
    }




    async validarId(funcionario_id) {
        const conexao = Banco.getConexao();


        try {
            const [rows] = await conexao.promise().execute("SELECT * FROM funcionarios WHERE id = ?", [funcionario_id]);


            if (rows.length === 0) {
                console.log("Funcionário não encontrado.");
                return false;
            }


            return rows[0]; // Retorna os dados do funcionário caso encontrado
        } catch (error) {
            console.log("Erro ao validar ID:", error);
            return false;
        }
    }


    async delete_funcionario() {
        const conexao = Banco.getConexao();


        const funcionarioExistente = await this.validarId(this._funcionario_id);


        if (!funcionarioExistente) {
            return false;
        }


        const atual = funcionarioExistente;


        const sqlDelete = "DELETE FROM funcionarios WHERE id = ?";
        const sqlLog = `
            INSERT INTO log_auditoria
            (tabela_afetada, id_registro_afetado, campo_modificado, valor_antigo, acao, usuario_responsavel)
            VALUES (?, ?, ?, ?, ?, ?)
        `;


        try {
            const usuario = this.usuario_logado;


            const logs = [
                ['funcionarios', this._funcionario_id, 'nome', String(atual.nome), 'DELETE', usuario],
                ['funcionarios', this._funcionario_id, 'email', String(atual.email), 'DELETE', usuario],
                ['funcionarios', this._funcionario_id, 'senha', String(atual.senha), 'DELETE', usuario],
                ['funcionarios', this._funcionario_id, 'cpf', String(atual.cpf), 'DELETE', usuario],
                ['funcionarios', this._funcionario_id, 'cargo_id', String(atual.cargo), 'DELETE', usuario],
                ['funcionarios', this._funcionario_id, 'salario', String(atual.salario), 'DELETE', usuario],
                ['funcionarios', this._funcionario_id, 'data_contratacao', atual.data_contratacao, 'DELETE', usuario],
                ['funcionarios', this._funcionario_id, 'departamento_id', String(atual.departamento_id), 'DELETE', usuario],
            ];


            for (const log of logs) {
                if (log[3] !== log[4]) {
                    await conexao.promise().execute(sqlLog, log);
                }
            }


            const [result] = await conexao.promise().execute(sqlDelete, [this._funcionario_id]);
            return result.affectedRows > 0;


        } catch (error) {
            console.log("Erro >>>", error);
            return false;
        }
    }


    async get_funcionario_by_id() {
        const conexao = Banco.getConexao();
        const sql = "SELECT * FROM funcionarios WHERE id = ?";


        try {
            const [result] = await conexao.promise().execute(sql, [this._funcionario_id]);


            if (result.length === 1) {
                return result;
            }


            return false;
        } catch (error) {
            console.log("Erro >>>", error);
            return false;
        }
    }


    async mediaSalarialGeral() {
        const conexao = Banco.getConexao();
        const sql = `
            SELECT AVG(salario) AS media_salarial
            FROM funcionarios
        `;
   
        try {
            const [result] = await conexao.promise().execute(sql);
            return result.length > 0 ? result[0].media_salarial : null;
        } catch (error) {
            console.log("Erro ao calcular média salarial geral:", error);
            return null;
        }
    }
   
    async get_all_funcionarios() {
        const conexao = Banco.getConexao();
        const sql = "SELECT * FROM funcionarios";


        try {
            const [result] = await conexao.promise().execute(sql);
            return result;
        } catch (error) {
            console.log("Erro >>>", error);
            return [];
        }
    }


    async readPage(pagina) {
        const itensPorPagina = 5;
        const inicio = (Number(pagina) - 1) * itensPorPagina;
        const conexao = Banco.getConexao();


        const sql = `SELECT * FROM funcionarios LIMIT ${inicio}, ${itensPorPagina}`;


        try {
            const [result] = await conexao.promise().query(sql);
            return result;
        } catch (error) {
            console.log("Erro >>>", error);
            return false;
        }
    }


    async get_Funcionario() {
        const conexao = Banco.getConexao();
        const mysql = "SELECT * FROM Funcionarios WHERE senha = md5(?) and email = ? ";
        try {
            const [result] = await conexao.promise().execute(mysql, [this._senha, this._email]);


            if (result.length === 1) {
                const funcionario = result[0];
                this._nome = funcionario.nome;
                this._cargo = funcionario.cargo;
                this._id_funcionario = funcionario.id;
                return true;
            }
            return false;
        } catch (error) {
            console.log("Erro>>" + error);
            return false;
        }
    }


    async verificarEmail() {
        const conexao = Banco.getConexao()
        const sql = "select * from funcionarios where email = ?"
        try {
            const [result] = await conexao.promise().execute(sql, [this._email])
            console.log(result)
            if (result.length > 0) {
                return true
            } else {
                return false;
            }
        } catch (error) {
            console.log("Errro >>>", error)
            return false
        }
    }

    async mediaSalarialGeral() {
        const conexao = Banco.getConexao();
        const sql = `
            SELECT AVG(salario) AS media_salarial
            FROM funcionarios
        `;
   
        try {
            const [result] = await conexao.promise().execute(sql);
            return result.length > 0 ? result[0].media_salarial : null;
        } catch (error) {
            console.log("Erro ao calcular média salarial geral:", error);
            return null;
        }
    }
    async totalFuncionariosAtivos() {
        const conexao = Banco.getConexao();
        const sql = `
            SELECT COUNT(*) AS total
            FROM funcionarios
        `;
        try {
            const [result] = await conexao.promise().execute(sql);
            return result[0].total;
        } catch (error) {
            console.log("Erro ao contar funcionários ativos:", error);
            return null;
        }
    }
    async funcionariosPorCargo() {
        const conexao = Banco.getConexao();
        const sql = `
            SELECT cargo, COUNT(*) AS total
            FROM funcionarios
            GROUP BY cargo
        `;
        try {
            const [result] = await conexao.promise().execute(sql);
            return result;
        } catch (error) {
            console.log("Erro ao obter funcionários por cargo:", error);
            return [];
        }
    }
    async proporcaoGenero() {
        const conexao = Banco.getConexao();
        const sql = `
            SELECT genero, COUNT(*) AS total
            FROM perfis
            WHERE genero IN ('masculino', 'feminino')
            GROUP BY genero
        `;
        try {
            const [result] = await conexao.promise().execute(sql);
            return result;
        } catch (error) {
            console.log("Erro ao calcular proporção de gênero:", error);
            return [];
        }
    }
    async distribuicaoSalarialPorDepartamento() {
        const conexao = Banco.getConexao();
        const sql = `
            SELECT 
                d.nome AS departamento,
                COUNT(f.id) AS total_funcionarios,
                AVG(f.salario) AS media_salarial,
                SUM(f.salario) AS total_salarial
            FROM funcionarios f
            JOIN departamentos d ON f.departamento_id = d.id
            GROUP BY d.nome
        `;
        try {
            const [result] = await conexao.promise().execute(sql);
            return result;
        } catch (error) {
            console.log("Erro ao obter distribuição salarial por departamento:", error);
            return [];
        }
    }
    async idadeMediaPorDepartamento() {
        const conexao = Banco.getConexao();
        const sql = `
            SELECT 
                d.nome AS departamento,
                AVG(p.idade) AS idade_media,
                COUNT(f.id) AS total_funcionarios
            FROM funcionarios f
            JOIN perfis p ON f.id = p.funcionario_id
            JOIN departamentos d ON f.departamento_id = d.id
            GROUP BY d.nome
        `;
        try {
            const [result] = await conexao.promise().execute(sql);
            return result;
        } catch (error) {
            console.log("Erro ao calcular idade média por departamento:", error);
            return [];
        }
    }
    
    


    async verificarDepartamento() {
        const conexao = Banco.getConexao();
        const sql = "SELECT id FROM departamentos WHERE id = ?";
        const [result] = await conexao.promise().execute(sql, [this._departamento_id]);
        return result.length > 0;
    }


    get email() {
        return this._email;
    }


    set email(value) {
        this._email = value;
    }
    get usuario_logado() {
        return this._usuario_logado;
    }


    set usuario_logado(value) {
        this._usuario_logado = value;
    }


    get nome() {
        return this._nome;
    }


    set nome(value) {
        this._nome = value;
    }


    get cpf() {
        return this._cpf;
    }


    set cpf(value) {
        this._cpf = value;
    }


    get senha() {
        return this._senha;
    }


    set senha(value) {
        this._senha = value;
    }
    get salario() {
        return this._salario;
    }


    set salario(value) {
        this._salario = value;
    }


    get departamento_id() {
        return this._departamento_id;
    }


    set departamento_id(value) {
        this._departamento_id = value;
    }


    get data_contratacao() {
        return this._data_contratacao;
    }


    set data_contratacao(value) {
        this._data_contratacao = value;
    }


    get cargo() {
        return this._cargo;
    }


    set cargo(value) {
        this._cargo = value;
    }


    get id_funcionario() {
        return this._id_funcionario;
    }


    set id_funcionario(value) {
        this._id_funcionario = value;
    }




}
