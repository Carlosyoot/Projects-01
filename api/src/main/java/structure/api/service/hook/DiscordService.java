package structure.api.service.hook;

import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class DiscordService {

    private static final String WEBHOOK_URL = "https://discord.com/api/webhooks/1360097640389410976/Hfl6uZvtphLRqtmiy0AqMjcS4rKPpverTn0gsRKNrnhy_HYGa0chZ5fuHiFOtdR3UCik";

    public void enviarMensagem(String mensagem) {
        try {
            String payload = String.format("{\"content\":\"%s\"}", mensagem);

            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(WEBHOOK_URL))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(payload))
                .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            System.out.println("Status do envio: " + response.statusCode());
            System.out.println("Status: " + response.statusCode());
            System.out.println("Resposta: " + response.body());
        } catch (Exception e) {
            System.err.println("Erro ao enviar mensagem para o Discord: " + e.getMessage());
        }
    }
}