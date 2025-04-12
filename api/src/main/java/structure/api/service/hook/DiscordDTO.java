package structure.api.service.hook;


import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Getter
@Setter
public class DiscordDTO {
    private String tipo; 
    private String usuario;
    private String titulo;
    private String detalhe;
    private LocalDateTime dataHora;
    private Integer percentual; 
    
    public String formatarMensagem() {
        String emoji = tipo.equals("finalizou") ? "✅" : "🔄";
        String acao = tipo.equals("finalizou") 
            ? "**finalizou a tarefa**" 
            : "**progrediu " + percentual + "% na tarefa**";
        
        DateTimeFormatter df = DateTimeFormatter.ofPattern("dd/MM/yyyy, HH:mm");
        String divisoria = "\n" + "═".repeat(20) + "\n";  
        
        return String.format(
            "%s\n<@%s>\n%s %s\n\t%s%s\n\t%s\n%s",
            divisoria,
            usuario,
            emoji,
            acao,
            titulo,
            (detalhe != null && !detalhe.isEmpty()) ? " - " + detalhe : "",
            dataHora.format(df),
            divisoria
        );
    }
}