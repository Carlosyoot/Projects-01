package structure.api.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import structure.api.service.hook.DiscordDTO;
import structure.api.service.hook.DiscordService;

@RestController
@RequestMapping("/discord")
public class DiscordController {

    @Autowired
    private DiscordService discordService;

    @PostMapping("/post")
    public String enviarMensagem(@RequestBody DiscordDTO dto) {
        discordService.enviarMensagem(dto.getMensagem());
        return "Mensagem enviada!";
    }
}