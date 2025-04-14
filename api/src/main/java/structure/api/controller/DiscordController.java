package structure.api.controller;

import java.time.LocalDateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpSession;
import structure.api.service.hook.DiscordDTO;
import structure.api.service.hook.DiscordService;

@RestController
@RequestMapping("/discord")
public class DiscordController {

    @Autowired
    private DiscordService discordService;
    
    @PostMapping("/post")
    public ResponseEntity<String> enviarNotificacaoTarefa(
            @RequestBody DiscordDTO dto,
            HttpSession session) {
        
        String discordUserId = (String) session.getAttribute("discord_user_id");
        
        if (discordUserId != null) {
            dto.setUsuario(discordUserId); 
        }
        
        if (dto.getUsuario() == null || dto.getTitulo() == null) {
            return ResponseEntity.badRequest().body("Usuário e título são obrigatórios");
        }

        if (dto.getDataHora() == null) {
            dto.setDataHora(LocalDateTime.now());
        }

        discordService.enviarNotificacao(dto);
        return ResponseEntity.ok("Notificação de tarefa enviada com sucesso!");
    }
}