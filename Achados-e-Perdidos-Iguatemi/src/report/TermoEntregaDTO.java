package report;

import model.Entrega;
import model.ItemPerdido;
import model.Proprietario;
import model.Usuario;
import java.text.SimpleDateFormat;
import java.util.Date;

public class TermoEntregaDTO {
    private String codigoAutenticacao;
    private String dataEntrega;
    private String horaEntrega;

    // Proprietário
    private String nomeProprietario;
    private String cpfProprietario;
    private String rgProprietario;
    private String telefoneProprietario;

    // Item
    private int numeroRegistro;
    private String nomeItem;
    private String marcaItem;
    private int numeroLacre;
    private String estadoConservacao;
    private String observacaoItem;

    // Fotos
    private String caminhoFotoCadastro;  // NOVO
    private String caminhoFotoEntrega;   // NOVO

    // Responsável
    private String nomeResponsavel;

    public TermoEntregaDTO(Entrega entrega, ItemPerdido item, Proprietario proprietario, Usuario usuario) {
        SimpleDateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy");
        SimpleDateFormat timeFormat = new SimpleDateFormat("HH:mm");

        this.codigoAutenticacao = entrega.getCodigoAutenticacao();
        this.dataEntrega = dateFormat.format(entrega.getDataEntrega());
        this.horaEntrega = timeFormat.format(entrega.getDataEntrega());

        // Proprietário
        this.nomeProprietario = proprietario.getNome();
        this.cpfProprietario = proprietario.getCpf() != null ? proprietario.getCpf() : "__________________";
        this.rgProprietario = proprietario.getRg() != null ? proprietario.getRg() : "__________________";
        this.telefoneProprietario = proprietario.getTelefone();

        // Item
        this.numeroRegistro = item.getNumeroRegistro();
        this.nomeItem = item.getNome();
        this.marcaItem = item.getMarca() != null ? item.getMarca() : "Não informada";
        this.numeroLacre = item.getNumeroLacre();
        this.estadoConservacao = item.getEstadoConservacao();
        this.observacaoItem = item.getObservacao() != null ? item.getObservacao() : "Nenhuma";

        // Fotos
        this.caminhoFotoCadastro = item.getCaminhoFoto();  // Foto do cadastro

        // Responsável
        this.nomeResponsavel = usuario.getNome();
    }

    // Getters existentes
    public String getCodigoAutenticacao() { return codigoAutenticacao; }
    public String getDataEntrega() { return dataEntrega; }
    public String getHoraEntrega() { return horaEntrega; }
    public String getNomeProprietario() { return nomeProprietario; }
    public String getCpfProprietario() { return cpfProprietario; }
    public String getRgProprietario() { return rgProprietario; }
    public String getTelefoneProprietario() { return telefoneProprietario; }
    public int getNumeroRegistro() { return numeroRegistro; }
    public String getNomeItem() { return nomeItem; }
    public String getMarcaItem() { return marcaItem; }
    public int getNumeroLacre() { return numeroLacre; }
    public String getEstadoConservacao() { return estadoConservacao; }
    public String getObservacaoItem() { return observacaoItem; }
    public String getNomeResponsavel() { return nomeResponsavel; }

    // NOVOS Getters para fotos
    public String getCaminhoFotoCadastro() { return caminhoFotoCadastro; }
    public void setCaminhoFotoEntrega(String caminhoFotoEntrega) { this.caminhoFotoEntrega = caminhoFotoEntrega; }
    public String getCaminhoFotoEntrega() { return caminhoFotoEntrega; }
}