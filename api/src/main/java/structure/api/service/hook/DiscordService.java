package structure.api.service.hook;

import structure.api.config.EnvConfig.DiscordConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DiscordService {
    
    private final DiscordConfig config;
    private final ObjectMapper objectMapper;
    
    public DiscordService(DiscordConfig config, ObjectMapper objectMapper) {
        this.config = config;
        this.objectMapper = objectMapper;
    }

    public void enviarNotificacao(DiscordDTO dto) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("content", dto.formatarMensagem());
            
            Map<String, Object> allowedMentions = new HashMap<>();
            allowedMentions.put("parse", List.of("users"));
            payload.put("allowed_mentions", allowedMentions);

            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(config.webhookUrl()))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
                .build();

            client.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                 .thenAccept(response -> {
                     if (response.statusCode() >= 400) {
                         System.err.println("Erro ao enviar: " + response.body());
                     }
                 });
        } catch (Exception e) {
            System.err.println("Erro no serviço Discord: " + e.getMessage());
        }
    }
}