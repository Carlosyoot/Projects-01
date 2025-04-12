package structure.api.controller;


import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import structure.api.service.hook.DiscordDTO;
import structure.api.service.hook.DiscordService;


@RestController
@RequestMapping("/discord")
public class DiscordController {

    @Autowired
    private DiscordService discordService;

    @PostMapping("/post")
    public ResponseEntity<String> enviarNotificacaoTarefa(@RequestBody DiscordDTO dto) {


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