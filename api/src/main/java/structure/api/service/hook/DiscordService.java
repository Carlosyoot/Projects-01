package structure.api.service.hook;

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
    private static final String WEBHOOK_URL = "https://discord.com/api/webhooks/1360097640389410976/Hfl6uZvtphLRqtmiy0AqMjcS4rKPpverTn0gsRKNrnhy_HYGa0chZ5fuHiFOtdR3UCik";
    private final ObjectMapper objectMapper = new ObjectMapper();

    public void enviarNotificacao(DiscordDTO dto) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("content", dto.formatarMensagem());
            
            Map<String, Object> allowedMentions = new HashMap<>();
            allowedMentions.put("parse", List.of("users"));
            payload.put("allowed_mentions", allowedMentions);

            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(WEBHOOK_URL))
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