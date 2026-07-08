import dao.EntregaDao;
import dao.ItemPerdidoDao;
import dao.ProprietarioDao;
import dao.UsuarioDao;
import model.Entrega;
import model.ItemPerdido;
import model.Proprietario;
import model.Usuario;
import report.TermoEntregaDTO;
import report.TermoEntregaPDF;

import java.io.File;
import java.util.List;

public class GenerateSampleTermo {
    public static void main(String[] args) throws Exception {
        List<Entrega> entregas = new EntregaDao().listarEntregas();
        if (entregas.isEmpty()) {
            throw new IllegalStateException("Nenhuma entrega encontrada para gerar termo de exemplo.");
        }

        Entrega entrega = entregas.get(0);
        ItemPerdido item = new ItemPerdidoDao().buscarPorId(entrega.getItemId());
        Proprietario proprietario = new ProprietarioDao().buscarPorId(entrega.getProprietarioId());
        Usuario usuario = new UsuarioDao().buscarPorId(entrega.getUsuarioId());

        if (item == null || proprietario == null || usuario == null) {
            throw new IllegalStateException("Nao foi possivel montar os dados do termo de exemplo.");
        }

        TermoEntregaDTO dados = new TermoEntregaDTO(entrega, item, proprietario, usuario);
        String fotoEntrega = new EntregaDao().getCaminhoFotoEntrega(entrega.getId());
        if (fotoEntrega != null) {
            dados.setCaminhoFotoEntrega(fotoEntrega);
        }

        File out = new File("C:\\Users\\Wellington Cristian\\Desktop\\shopping\\documentacao_sistema\\relatorios\\termo_entrega_exemplo.pdf");
        new TermoEntregaPDF().gerarTermo(dados, out.getAbsolutePath());
        System.out.println(out.getAbsolutePath());
    }
}
