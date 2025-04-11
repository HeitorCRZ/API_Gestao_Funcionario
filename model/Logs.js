const Banco = require("./Banco")

module.exports = class Logs {

    async readPageLogs(pagina) {
        const itensPorPagina = 5;
        const inicio = (Number(pagina) - 1) * itensPorPagina;
        const conexao = Banco.getConexao();

        const sql = `SELECT 
                tabela_afetada,
                id_registro_afetado,
                acao,
                usuario_responsavel,
                data_hora,
                GROUP_CONCAT(
                    CONCAT(campo_modificado, ': ', IFNULL(valor_antigo, 'NULL'), ' -> ', IFNULL(valor_novo, 'NULL'))
                    ORDER BY campo_modificado
                    SEPARATOR '; '
                ) AS alteracoes
            FROM 
                log_auditoria
            GROUP BY 
                tabela_afetada,
                id_registro_afetado,
                acao,
                data_hora,
                usuario_responsavel
            ORDER BY 
                data_hora DESC
            LIMIT ${inicio}, ${itensPorPagina}`;

        try {
            const [result] = await conexao.promise().query(sql);
            return result;
        } catch (error) {
            console.log("Erro >>>", error);
            return false;
        }
    }


}
