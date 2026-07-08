package dao;

import model.ItemPerdido;
import model.ItemEletronico;
import model.ItemVestuario;
import util.ConexaoDB;
import java.sql.*;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.sql.Timestamp;
import java.time.LocalDateTime;

public class ItemPerdidoDao {
    private ConexaoDB conexao = new ConexaoDB();

    public int inserirItem(ItemPerdido item) {
        String sql = "INSERT INTO itens_perdidos (numero_registro, nome, marca, numero_lacre, " +
                "estado_conservacao, observacao, nome_entregador, local_id, situacao_id, " +
                "usuario_responsavel_id, operador_id, assinatura_operador, tipo_id, caixa_id) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = conexao.conectar();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            stmt.setInt(1, item.getNumeroRegistro());
            stmt.setString(2, item.getNome());
            stmt.setString(3, item.getMarca());
            stmt.setInt(4, item.getNumeroLacre());
            stmt.setString(5, item.getEstadoConservacao());
            stmt.setString(6, item.getObservacao());
            stmt.setString(7, item.getNomeEntregador());      // nome_entregador
            stmt.setInt(8, item.getLocalId());                // local_id
            stmt.setInt(9, item.getSituacaoId());             // situacao_id
            stmt.setInt(10, item.getUsuarioResponsavelId());  // usuario_responsavel_id (ID do usuário que cadastrou)
            if (item.getOperadorId() != null) {
                stmt.setInt(11, item.getOperadorId());
            } else {
                stmt.setNull(11, Types.INTEGER);
            }
            stmt.setString(12, item.getAssinaturaOperador());
            stmt.setInt(13, item.getTipoId());                // tipo_id
            if (item.getCaixaId() != null) {
                stmt.setInt(14, item.getCaixaId());           // caixa_id
            } else {
                stmt.setNull(14, Types.INTEGER);
            }

            stmt.executeUpdate();

            ResultSet rs = stmt.getGeneratedKeys();
            if (rs.next()) {
                return rs.getInt(1);
            }
        } catch (Exception e) {
            System.out.println("Erro ao inserir item: " + e.getMessage());
            e.printStackTrace();
        }
        return -1;
    }

    public int inserirItemEletronico(ItemEletronico itemEletronico) {
        String sql = "INSERT INTO itens_eletronicos (item_id, modelo) VALUES (?, ?)";
        try (Connection conn = conexao.conectar();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            stmt.setInt(1, itemEletronico.getItemId());
            stmt.setString(2, itemEletronico.getModelo());

            stmt.executeUpdate();

            return itemEletronico.getItemId();
        } catch (Exception e) {
            System.out.println("Erro ao inserir item eletrônico: " + e.getMessage());
            e.printStackTrace();
        }
        return -1;
    }

    public int inserirItemVestuario(ItemVestuario itemVestuario) {
        String sql = "INSERT INTO itens_vestuario (item_id, cor, tamanho) VALUES (?, ?, ?)";
        try (Connection conn = conexao.conectar();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            stmt.setInt(1, itemVestuario.getItemId());
            stmt.setString(2, itemVestuario.getCor());
            stmt.setString(3, itemVestuario.getTamanho());

            stmt.executeUpdate();

            return itemVestuario.getItemId();
        } catch (Exception e) {
            System.out.println("Erro ao inserir item vestuário: " + e.getMessage());
            e.printStackTrace();
        }
        return -1;
    }

    public List<ItemPerdido> listarItens() {
        List<ItemPerdido> itens = new ArrayList<>();
        String sql = "SELECT ip.*, i.caminho AS caminho_foto, COALESCE(o.nome_completo, u.nome) AS nome_responsavel " +
                "FROM itens_perdidos ip " +
                "LEFT JOIN imagens_item ii ON ii.item_id = ip.id " +
                "LEFT JOIN imagens i ON i.id = ii.imagem_id " +
                "LEFT JOIN usuarios u ON ip.usuario_responsavel_id = u.id " +
                "LEFT JOIN operadores o ON ip.operador_id = o.id " +
                "WHERE ip.ativo = 1 ORDER BY ip.data_registro DESC";
        try (Connection conn = conexao.conectar();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                ItemPerdido item = new ItemPerdido();
                item.setId(rs.getInt("id"));
                item.setNumeroRegistro(rs.getInt("numero_registro"));
                item.setNome(rs.getString("nome"));
                item.setMarca(rs.getString("marca"));
                item.setDataRegistro(rs.getTimestamp("data_registro"));
                item.setNumeroLacre(rs.getInt("numero_lacre"));
                item.setEstadoConservacao(rs.getString("estado_conservacao"));
                item.setObservacao(rs.getString("observacao"));
                item.setNomeEntregador(rs.getString("nome_entregador"));
                item.setResponsavelCadastro(rs.getString("nome_responsavel")); // Nome do responsável via JOIN
                item.setLocalId(rs.getInt("local_id"));
                item.setSituacaoId(rs.getInt("situacao_id"));
                item.setUsuarioResponsavelId(rs.getInt("usuario_responsavel_id"));
                item.setOperadorId((Integer) rs.getObject("operador_id"));
                item.setAssinaturaOperador(rs.getString("assinatura_operador"));
                item.setTipoId(rs.getInt("tipo_id"));
                item.setCaixaId((Integer) rs.getObject("caixa_id"));
                item.setAtivo(rs.getBoolean("ativo"));
                item.setCaminhoFoto(rs.getString("caminho_foto"));
                itens.add(item);
            }
        } catch (Exception e) {
            System.out.println("Erro ao listar itens: " + e.getMessage());
            e.printStackTrace();
        }
        return itens;
    }

    public int obterProximoNumeroRegistro() {
        String sql = "SELECT MAX(numero_registro) as ultimo FROM itens_perdidos";
        try (Connection conn = conexao.conectar();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            if (rs.next()) {
                return rs.getInt("ultimo") + 1;
            }
        } catch (Exception e) {
            System.out.println("Erro ao obter próximo número: " + e.getMessage());
            e.printStackTrace();
        }
        return 1;
    }

    public List<ItemPerdido> buscarItens(String termo) {
        List<ItemPerdido> itens = new ArrayList<>();

        // Verifica se o termo é um número (para buscar por lacre ou número de registro)
        boolean isNumero = termo.matches("\\d+");

        String sql;
        if (isNumero) {
            // Se for número, converte para inteiro e busca em campos numéricos
            int numero = Integer.parseInt(termo);
            sql = "SELECT ip.*, i.caminho AS caminho_foto, COALESCE(o.nome_completo, u.nome) AS nome_responsavel " +
                    "FROM itens_perdidos ip " +
                    "LEFT JOIN imagens_item ii ON ii.item_id = ip.id " +
                    "LEFT JOIN imagens i ON i.id = ii.imagem_id " +
                    "LEFT JOIN usuarios u ON ip.usuario_responsavel_id = u.id " +
                    "LEFT JOIN operadores o ON ip.operador_id = o.id " +
                    "WHERE ip.ativo = 1 AND (ip.numero_registro = ? OR ip.numero_lacre = ? " +
                    "OR ip.nome LIKE ? OR ip.marca LIKE ? OR ip.observacao LIKE ?) " +
                    "ORDER BY ip.data_registro DESC";
        } else {
            // Se não for número, busca apenas em campos de texto
            sql = "SELECT ip.*, i.caminho AS caminho_foto, COALESCE(o.nome_completo, u.nome) AS nome_responsavel " +
                    "FROM itens_perdidos ip " +
                    "LEFT JOIN imagens_item ii ON ii.item_id = ip.id " +
                    "LEFT JOIN imagens i ON i.id = ii.imagem_id " +
                    "LEFT JOIN usuarios u ON ip.usuario_responsavel_id = u.id " +
                    "LEFT JOIN operadores o ON ip.operador_id = o.id " +
                    "WHERE ip.ativo = 1 AND (ip.nome LIKE ? OR ip.marca LIKE ? OR ip.observacao LIKE ?) " +
                    "ORDER BY ip.data_registro DESC";
        }

        try (Connection conn = conexao.conectar();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            String termoBusca = "%" + termo + "%";

            if (isNumero) {
                int numero = Integer.parseInt(termo);
                stmt.setInt(1, numero);        // numero_registro
                stmt.setInt(2, numero);        // numero_lacre
                stmt.setString(3, termoBusca); // nome
                stmt.setString(4, termoBusca); // marca
                stmt.setString(5, termoBusca); // observacao
            } else {
                stmt.setString(1, termoBusca); // nome
                stmt.setString(2, termoBusca); // marca
                stmt.setString(3, termoBusca); // observacao
            }

            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                ItemPerdido item = new ItemPerdido();
                item.setId(rs.getInt("id"));
                item.setNumeroRegistro(rs.getInt("numero_registro"));
                item.setNome(rs.getString("nome"));
                item.setMarca(rs.getString("marca"));
                item.setDataRegistro(rs.getTimestamp("data_registro"));
                item.setNumeroLacre(rs.getInt("numero_lacre"));
                item.setEstadoConservacao(rs.getString("estado_conservacao"));
                item.setObservacao(rs.getString("observacao"));
                item.setNomeEntregador(rs.getString("nome_entregador"));
                item.setResponsavelCadastro(rs.getString("nome_responsavel"));
                item.setLocalId(rs.getInt("local_id"));
                item.setSituacaoId(rs.getInt("situacao_id"));
                item.setUsuarioResponsavelId(rs.getInt("usuario_responsavel_id"));
                item.setOperadorId((Integer) rs.getObject("operador_id"));
                item.setAssinaturaOperador(rs.getString("assinatura_operador"));
                item.setTipoId(rs.getInt("tipo_id"));
                item.setCaixaId((Integer) rs.getObject("caixa_id"));
                item.setAtivo(rs.getBoolean("ativo"));
                item.setCaminhoFoto(rs.getString("caminho_foto"));
                itens.add(item);
            }
        } catch (Exception e) {
            System.out.println("Erro ao buscar itens: " + e.getMessage());
            e.printStackTrace();
        }
        return itens;
    }

    public boolean atualizarSituacao(int itemId, int situacaoId) {
        String sql = "UPDATE itens_perdidos SET situacao_id = ? WHERE id = ?";
        try (Connection conn = conexao.conectar();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, situacaoId);
            stmt.setInt(2, itemId);
            return stmt.executeUpdate() > 0;
        } catch (Exception e) {
            System.out.println("Erro ao atualizar situação: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    public boolean desativarItem(int id) {
        String sql = "UPDATE itens_perdidos SET ativo = 0 WHERE id = ?";
        try (Connection conn = conexao.conectar();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            return stmt.executeUpdate() > 0;
        } catch (Exception e) {
            System.out.println("Erro ao desativar item: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    public ItemPerdido buscarPorId(int id) {
        String sql = "SELECT ip.*, i.caminho AS caminho_foto, COALESCE(o.nome_completo, u.nome) AS nome_responsavel " +
                "FROM itens_perdidos ip " +
                "LEFT JOIN imagens_item ii ON ii.item_id = ip.id " +
                "LEFT JOIN imagens i ON i.id = ii.imagem_id " +
                "LEFT JOIN usuarios u ON ip.usuario_responsavel_id = u.id " +
                "LEFT JOIN operadores o ON ip.operador_id = o.id " +
                "WHERE ip.id = ? AND ip.ativo = 1";
        try (Connection conn = conexao.conectar();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                ItemPerdido item = new ItemPerdido();
                item.setId(rs.getInt("id"));
                item.setNumeroRegistro(rs.getInt("numero_registro"));
                item.setNome(rs.getString("nome"));
                item.setMarca(rs.getString("marca"));
                item.setDataRegistro(rs.getTimestamp("data_registro"));
                item.setNumeroLacre(rs.getInt("numero_lacre"));
                item.setEstadoConservacao(rs.getString("estado_conservacao"));
                item.setObservacao(rs.getString("observacao"));
                item.setNomeEntregador(rs.getString("nome_entregador"));
                item.setResponsavelCadastro(rs.getString("nome_responsavel"));
                item.setLocalId(rs.getInt("local_id"));
                item.setSituacaoId(rs.getInt("situacao_id"));
                item.setUsuarioResponsavelId(rs.getInt("usuario_responsavel_id"));
                item.setOperadorId((Integer) rs.getObject("operador_id"));
                item.setAssinaturaOperador(rs.getString("assinatura_operador"));
                item.setTipoId(rs.getInt("tipo_id"));
                item.setCaixaId((Integer) rs.getObject("caixa_id"));
                item.setAtivo(rs.getBoolean("ativo"));
                item.setCaminhoFoto(rs.getString("caminho_foto"));
                return item;
            }
        } catch (Exception e) {
            System.out.println("Erro ao buscar item por ID: " + e.getMessage());
            e.printStackTrace();
        }
        return null;
    }

    public void salvarImagemItem(int itemId, String caminho) {
        String sql = "INSERT INTO imagens (caminho) VALUES (?)";
        try (Connection conn = conexao.conectar();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setString(1, caminho);
            stmt.executeUpdate();

            ResultSet rs = stmt.getGeneratedKeys();
            if (rs.next()) {
                int imagemId = rs.getInt(1);
                String sqlAssoc = "INSERT INTO imagens_item (imagem_id, item_id) VALUES (?, ?)";
                try (PreparedStatement stmtAssoc = conn.prepareStatement(sqlAssoc)) {
                    stmtAssoc.setInt(1, imagemId);
                    stmtAssoc.setInt(2, itemId);
                    stmtAssoc.executeUpdate();
                }
            }
        } catch (Exception e) {
            System.out.println("Erro ao salvar imagem do item: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public int getItemIdPorNumeroRegistro(int numeroRegistro) {
        String sql = "SELECT id FROM itens_perdidos WHERE numero_registro = ? AND ativo = 1";
        try (Connection conn = conexao.conectar();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, numeroRegistro);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return rs.getInt("id");
            }
        } catch (Exception e) {
            System.out.println("Erro ao buscar ID por número de registro: " + e.getMessage());
            e.printStackTrace();
        }
        return -1;
    }

    public List<ItemPerdido> listarPendentesPorTipos(List<Integer> tipoIds) {
        List<ItemPerdido> itens = new ArrayList<>();
        if (tipoIds.isEmpty()) return itens;

        String placeholders = String.join(",", Collections.nCopies(tipoIds.size(), "?"));
        String sql = "SELECT id, numero_registro, nome, marca, numero_lacre, estado_conservacao, observacao, " +
                "local_id, situacao_id, usuario_responsavel_id, operador_id, assinatura_operador, tipo_id, caixa_id, ativo " +
                "FROM itens_perdidos " +
                "WHERE situacao_id IN (1,2,3) AND tipo_id IN (" + placeholders + ") " +
                "ORDER BY data_registro DESC";

        try (Connection conn = conexao.conectar();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            for (int i = 0; i < tipoIds.size(); i++) {
                stmt.setInt(i + 1, tipoIds.get(i));
            }
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                ItemPerdido item = new ItemPerdido();
                item.setId(rs.getInt("id"));
                item.setNumeroRegistro(rs.getInt("numero_registro"));
                item.setNome(rs.getString("nome"));
                item.setMarca(rs.getString("marca"));
                item.setNumeroLacre(rs.getInt("numero_lacre")); // ADICIONADO
                item.setEstadoConservacao(rs.getString("estado_conservacao"));
                item.setObservacao(rs.getString("observacao"));
                item.setLocalId(rs.getInt("local_id"));
                item.setSituacaoId(rs.getInt("situacao_id"));
                item.setUsuarioResponsavelId(rs.getInt("usuario_responsavel_id"));
                item.setOperadorId((Integer) rs.getObject("operador_id"));
                item.setAssinaturaOperador(rs.getString("assinatura_operador"));
                item.setTipoId(rs.getInt("tipo_id"));
                item.setCaixaId((Integer) rs.getObject("caixa_id"));
                item.setAtivo(rs.getBoolean("ativo"));
                itens.add(item);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return itens;
    }

    /**
     * MÉTODO CORRIGIDO - Busca itens parecidos com a requisição (ignorando acentos e buscando por palavras-chave)
     * Funciona mesmo com palavras embaralhadas e com/sem acentos
     */
    public List<ItemPerdido> buscarItensParecidos(Integer tipoId, String descricao) {
        List<ItemPerdido> resultado = new ArrayList<>();

        // Se não tem descrição, não tem como buscar itens parecidos
        if (descricao == null || descricao.trim().isEmpty()) {
            return resultado;
        }

        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            conn = conexao.conectar();

            // PASSO 1: Normaliza a descrição (remove acentos e converte para minúsculas)
            String descricaoNormalizada = removerAcentos(descricao.toLowerCase());

            // PASSO 2: Divide em palavras e filtra as que têm pelo menos 3 caracteres
            String[] palavras = descricaoNormalizada.split("\\s+");
            List<String> palavrasRelevantes = new ArrayList<>();

            for (String palavra : palavras) {
                palavra = palavra.trim();
                if (palavra.length() >= 3 && !palavra.matches(".*\\d.*")) { // Ignora palavras muito curtas e com números
                    palavrasRelevantes.add(palavra);
                }
            }

            // Se não sobrou palavras relevantes, usa a frase completa
            if (palavrasRelevantes.isEmpty()) {
                palavrasRelevantes.add(descricaoNormalizada);
            }

            // PASSO 3: Constrói a query dinâmica
            StringBuilder sql = new StringBuilder();
            sql.append("SELECT ip.*, t.nome as tipo_nome ");
            sql.append("FROM itens_perdidos ip ");
            sql.append("LEFT JOIN tipos_objeto t ON ip.tipo_id = t.id ");
            sql.append("WHERE ip.situacao_id IN (1, 2, 3) "); // Apenas itens não devolvidos/finalizados

            // Adiciona condição para o tipo, se informado
            if (tipoId != null && tipoId > 0) {
                sql.append("AND ip.tipo_id = ? ");
            }

            sql.append("AND (");

            // Adiciona condição para cada palavra (ignorando acentos com COLLATE)
            for (int i = 0; i < palavrasRelevantes.size(); i++) {
                if (i > 0) {
                    sql.append(" OR ");
                }
                sql.append("(LOWER(ip.nome) COLLATE utf8mb4_general_ci LIKE ? ");
                sql.append("OR LOWER(ip.marca) COLLATE utf8mb4_general_ci LIKE ? ");
                sql.append("OR LOWER(ip.observacao) COLLATE utf8mb4_general_ci LIKE ?)");
            }

            sql.append(") ORDER BY ");

            // Prioriza mesma categoria se informada
            if (tipoId != null && tipoId > 0) {
                sql.append("CASE WHEN ip.tipo_id = ? THEN 0 ELSE 1 END, ");
            }

            sql.append("ip.data_registro DESC LIMIT 10");

            // PASSO 4: Prepara a statement
            stmt = conn.prepareStatement(sql.toString());

            int paramIndex = 1;

            // Adiciona o parâmetro do tipo, se informado
            if (tipoId != null && tipoId > 0) {
                stmt.setInt(paramIndex++, tipoId);
            }

            // Adiciona os parâmetros para cada palavra (3 parâmetros por palavra: nome, marca, observacao)
            for (String palavra : palavrasRelevantes) {
                String termo = "%" + palavra + "%";
                stmt.setString(paramIndex++, termo); // para nome
                stmt.setString(paramIndex++, termo); // para marca
                stmt.setString(paramIndex++, termo); // para observacao
            }

            // Adiciona o tipo para ordenação, se informado
            if (tipoId != null && tipoId > 0) {
                stmt.setInt(paramIndex++, tipoId);
            }

            // PASSO 5: Executa a query
            rs = stmt.executeQuery();

            while (rs.next()) {
                ItemPerdido item = new ItemPerdido();
                item.setId(rs.getInt("id"));
                item.setNumeroRegistro(rs.getInt("numero_registro"));
                item.setNome(rs.getString("nome"));
                item.setMarca(rs.getString("marca"));
                item.setDataRegistro(rs.getTimestamp("data_registro"));
                item.setObservacao(rs.getString("observacao"));
                item.setTipoId(rs.getInt("tipo_id"));
                item.setSituacaoId(rs.getInt("situacao_id"));
                resultado.add(item);
            }

        } catch (SQLException e) {
            System.err.println("Erro ao buscar itens parecidos: " + e.getMessage());
            e.printStackTrace();
        } finally {
            try {
                if (rs != null) rs.close();
                if (stmt != null) stmt.close();
                if (conn != null) conn.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }

        return resultado;
    }

    /**
     * Método auxiliar para remover acentos de uma string
     */
    private String removerAcentos(String texto) {
        if (texto == null) return "";

        // Normaliza a string e remove os caracteres de acentuação
        String textoNormalizado = java.text.Normalizer.normalize(texto, java.text.Normalizer.Form.NFD);
        return textoNormalizado.replaceAll("[\\p{InCombiningDiacriticalMarks}]", "");
    }

    public int atualizarSituacoesVencidasComContagem() {
        String sql = """
            UPDATE itens_perdidos ip
            INNER JOIN tipos_objeto t ON ip.tipo_id = t.id
            SET ip.situacao_id = CASE
                WHEN DATEDIFF(CURRENT_DATE, ip.data_registro) >= t.prazo_dias THEN 3
                WHEN DATEDIFF(CURRENT_DATE, ip.data_registro) = t.prazo_dias - 1 THEN 2
                ELSE ip.situacao_id
            END
            WHERE
                ip.situacao_id IN (1, 2)
                AND t.prazo_dias IS NOT NULL
                AND t.prazo_dias > 0
                AND (
                    (DATEDIFF(CURRENT_DATE, ip.data_registro) >= t.prazo_dias AND ip.situacao_id <> 3)
                    OR (DATEDIFF(CURRENT_DATE, ip.data_registro) = t.prazo_dias - 1 AND ip.situacao_id <> 2)
                )
        """;

        try (Connection conn = conexao.conectar();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            int rowsAffected = stmt.executeUpdate();
            System.out.println("Atualizacao automatica de situacoes: " + rowsAffected + " itens modificados.");
            return rowsAffected;
        } catch (SQLException e) {
            System.err.println("Erro ao atualizar situacoes vencidas: " + e.getMessage());
            e.printStackTrace();
            return 0;
        }
    }

    /**
     * Atualiza automaticamente a situação dos itens com base no prazo definido para cada tipo de objeto.
     * - Vence hoje: quando faltar exatamente 1 dia para o prazo (prazo_dias - 1)
     * - Vencido: quando já passou do prazo (prazo_dias ou mais)
     * Só atualiza itens que ainda estão "No prazo" (1) ou "Vence hoje" (2).
     */
    public void atualizarSituacoesVencidas() {
        String sql = """
            UPDATE itens_perdidos ip
            INNER JOIN tipos_objeto t ON ip.tipo_id = t.id
            SET ip.situacao_id = CASE
                WHEN DATEDIFF(CURRENT_DATE, ip.data_registro) >= t.prazo_dias THEN 3
                WHEN DATEDIFF(CURRENT_DATE, ip.data_registro) = t.prazo_dias - 1 THEN 2
                ELSE ip.situacao_id
            END
            WHERE 
                ip.situacao_id IN (1, 2)
                AND t.prazo_dias IS NOT NULL 
                AND t.prazo_dias > 0
                AND (
                    (DATEDIFF(CURRENT_DATE, ip.data_registro) >= t.prazo_dias AND ip.situacao_id <> 3)
                    OR (DATEDIFF(CURRENT_DATE, ip.data_registro) = t.prazo_dias - 1 AND ip.situacao_id <> 2)
                )
        """;

        try (Connection conn = conexao.conectar();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            int rowsAffected = stmt.executeUpdate();
            System.out.println("Atualização automática de situações: " + rowsAffected + " itens modificados.");

        } catch (SQLException e) {
            System.err.println("Erro ao atualizar situações vencidas: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
