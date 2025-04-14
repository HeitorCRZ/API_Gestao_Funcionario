const Banco = require("./Banco")

module.exports = class Departamento {

  constructor() {
    this._nome = ""
    this._orcamento = null
    this._data_criacao = null
    this.localizacao = ""
    this.usuario_logado = ""
    this._departamento_id = null
  }
  async post_departamento() {
    const conexao = Banco.getConexao();
    const sql = "INSERT INTO departamentos (nome, orcamento, localizacao, data_criacao) VALUES (?, ?, ?, ?)";
    console.log("Dado ---> " + this.nome);
    try {
      const [result] = await conexao.promise().execute(sql, [this.nome, this.orcamento, this.localizacao, this.data_criacao]);
      this._idUFuncionario = result.insertId;

      const sqlLog = `
              INSERT INTO log_auditoria 
              (tabela_afetada, id_registro_afetado, campo_modificado, valor_novo, acao, usuario_responsavel)
              VALUES (?, ?, ?, ?, ?, ?)
          `;

      const usuario = this.usuario_logado; // Defina de onde vem o usuário
      const id = this._idUFuncionario;

      const logs = [
        ['departamentos', id, 'nome', this.nome, 'INSERT', usuario],
        ['departamentos', id, 'orcamento', String(this.orcamento), 'INSERT', usuario],
        ['departamentos', id, 'localizacao', this.localizacao, 'INSERT', usuario],
        ['departamentos', id, 'data_criacao', this.data_criacao, 'INSERT', usuario]
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
  async verificarDepartamento() {
    const conexao = Banco.getConexao()
    const sql = "select * from departamentos where nome = ?"
    console.log("Dado ---> " + this.nome);
    try {
      const [result] = await conexao.promise().execute(sql, [this._nome])
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
  async put_departamento() {
    const conexao = Banco.getConexao();

    const departamentoExistente = await this.validarId(this._departamento_id);
    if (!departamentoExistente) {
      return false;
    }

    const atual = departamentoExistente;

    const sql = `
        UPDATE departamentos 
        SET nome = ?, orcamento = ?, localizacao = ?, data_criacao = ? 
        WHERE id = ?
    `;

    try {
      const [result] = await conexao.promise().execute(sql, [
        this.nome,
        this.orcamento,
        this.localizacao,
        this.data_criacao,
        this._departamento_id
      ]);

      const usuario = this.usuario_logado;
      const sqlLog = `
            INSERT INTO log_auditoria 
            (tabela_afetada, id_registro_afetado, campo_modificado, valor_novo, valor_antigo, acao, usuario_responsavel)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

      const logs = [
        ['departamentos', this._departamento_id, 'nome', this.nome, String(atual.nome), 'UPDATE', usuario],
        ['departamentos', this._departamento_id, 'orcamento', String(this.orcamento), String(atual.orcamento), 'UPDATE', usuario],
        ['departamentos', this._departamento_id, 'localizacao', this.localizacao, String(atual.localizacao), 'UPDATE', usuario],
        ['departamentos', this._departamento_id, 'data_criacao', this.data_criacao, atual.data_criacao, 'UPDATE', usuario]
      ];

      for (const log of logs) {
        if (log[3] !== log[4]) { // log[3] = valor_novo, log[4] = valor_antigo
          await conexao.promise().execute(sqlLog, log);
        }
      }

      return result.affectedRows > 0;
    } catch (error) {
      console.log("Erro ao atualizar departamento:", error);
      return false;
    }
  }
  async get_Departamento_por_nome() {
    const conexao = Banco.getConexao();
    const sql = "SELECT * FROM Departamentos WHERE nome LIKE ?";
    try {
      const [resultado] = await conexao.promise().execute(sql, [`%${this._nome}%`]);

      return resultado; // retorna o array direto para o controle tratar
    } catch (erro) {
      console.log("Erro no get_Departamento_por_nome >>", erro);
      return false;
    }
  }
  async delete_departamento() {
    const conexao = Banco.getConexao();

    const departamentoExistente = await this.validarId(this._departamento_id);

    if (!departamentoExistente) {
      return false;
    }

    const atual = departamentoExistente;

    const sqlDelete = "DELETE FROM departamentos WHERE id = ?";
    const sqlLog = `
        INSERT INTO log_auditoria 
        (tabela_afetada, id_registro_afetado, campo_modificado, valor_antigo, acao, usuario_responsavel)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    try {
      const usuario = this.usuario_logado;

      const logs = [
        ['departamentos', this._departamento_id, 'nome', String(atual.nome), 'DELETE', usuario],
        ['departamentos', this._departamento_id, 'orcamento', String(atual.orcamento), 'DELETE', usuario],
        ['departamentos', this._departamento_id, 'localizacao', String(atual.localizacao), 'DELETE', usuario],
        ['departamentos', this._departamento_id, 'data_criacao', atual.data_criacao, 'DELETE', usuario]
      ];

      for (const log of logs) {
        if (log[3] !== log[4]) {
          await conexao.promise().execute(sqlLog, log);
        }
      }

      const [result] = await conexao.promise().execute(sqlDelete, [this._departamento_id]);
      return result.affectedRows > 0;

    } catch (error) {
      console.log("Erro ao deletar departamento:", error);
      return false;
    }
  }
  async get_departamento_by_id() {
    const conexao = Banco.getConexao();
    const sql = "SELECT * FROM departamentos WHERE id = ?";

    try {
      const [result] = await conexao.promise().execute(sql, [this._departamento_id]);

      if (result.length === 1) {
        const departamento = result[0];
        this.nome = departamento.nome;
        this.orcamento = departamento.orcamento;
        this.localizacao = departamento.localizacao;
        this.data_criacao = departamento.data_criacao;
        return result;
      }

      return false;
    } catch (error) {
      console.log("Erro ao buscar departamento por ID >>>", error);
      return false;
    }
  }
  async get_all_departamentos() {
    const conexao = Banco.getConexao();
    const sql = "SELECT * FROM departamentos";

    try {
      const [result] = await conexao.promise().execute(sql);
      return result;
    } catch (error) {
      console.log("Erro ao buscar todos os departamentos >>>", error);
      return [];
    }
  }

  async validarId(departamento_id) {
    const conexao = Banco.getConexao();

    try {
      const [rows] = await conexao.promise().execute("SELECT * FROM departamentos WHERE id = ?", [departamento_id]);

      if (rows.length === 0) {
        console.log("Departamento não encontrado.");
        return false;
      }

      return rows[0]; // Retorna os dados do funcionário caso encontrado
    } catch (error) {
      console.log("Erro ao validar ID:", error);
      return false;
    }
  }

  async readPage(pagina) {
    const itensPorPagina = 5;
    const inicio = (Number(pagina) - 1) * itensPorPagina;
    const conexao = Banco.getConexao();

    const sql = `SELECT * FROM departamentos LIMIT ${inicio}, ${itensPorPagina}`;

    try {
      const [result] = await conexao.promise().query(sql);
      return result;
    } catch (error) {
      console.log("Erro >>>", error);
      return false;
    }
  }



  get nome() {
    return this._nome;
  }

  set nome(value) {
    this._nome = value;
  }
  get usuario_logado() {
    return this._usuario_logado;
  }

  set usuario_logado(value) {
    this._usuario_logado = value;
  }

  get orcamento() {
    return this._orcamento;
  }

  set orcamento(value) {
    this._orcamento = value;
  }

  get localizacao() {
    return this._localizacao;
  }

  set localizacao(value) {
    this._localizacao = value;
  }

  get data_criacao() {
    return this._data_criacao;
  }

  set data_criacao(value) {
    this._data_criacao = value;
  }
  get departamento_id() {
    return this._departamento_id;
  }

  set departamento_id(value) {
    this._departamento_id = value;
  }


}