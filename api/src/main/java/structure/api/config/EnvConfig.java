package structure.api.config;

import io.github.cdimascio.dotenv.Dotenv;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;


@Configuration
public class EnvConfig {
    
    private static final Dotenv dotenv = Dotenv.load();
    
    @Bean
    public DiscordConfig discordConfig() {
        return new DiscordConfig(
            dotenv.get("DISCORD_CLIENT_ID"),
            dotenv.get("DISCORD_CLIENT_SECRET"),
            dotenv.get("DISCORD_REDIRECT_URI"),
            dotenv.get("DISCORD_WEBHOOK_URL")
        );
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
        
    public record DiscordConfig(
        String clientId,
        String clientSecret,
        String redirectUri,
        String webhookUrl
    ) {}
}