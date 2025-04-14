package structure.api.service.hook;

import structure.api.config.EnvConfig.DiscordConfig;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
public class DiscordAuthService {
    
    private final DiscordConfig config;
    private final RestTemplate restTemplate;
    
    public DiscordAuthService(DiscordConfig config) {
        this.config = config;
        this.restTemplate = new RestTemplate();
    }
    
    public String getAuthorizationUrl(String state) {
        return "https://discord.com/api/oauth2/authorize" +
            "?client_id=" + config.clientId() +
            "&redirect_uri=" + URLEncoder.encode(config.redirectUri(), StandardCharsets.UTF_8) +
            "&response_type=code" +
            "&state=" + state +
            "&scope=identify";
    }
    
    public DiscordUser exchangeCodeForUser(String code) {

        String token = exchangeCodeForToken(code);
        
        return getUserData(token);
    }
    
    private String exchangeCodeForToken(String code) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("client_id", config.clientId());
        body.add("client_secret", config.clientSecret());
        body.add("grant_type", "authorization_code");
        body.add("code", code);
        body.add("redirect_uri", config.redirectUri());
        body.add("scope", "identify");
        
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
        
        ResponseEntity<TokenResponse> response = restTemplate.postForEntity(
            "https://discord.com/api/oauth2/token",
            request,
            TokenResponse.class
        );
        
        return response.getBody().access_token();
    }
    
    private DiscordUser getUserData(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        
        HttpEntity<String> entity = new HttpEntity<>(headers);
        
        ResponseEntity<DiscordUser> response = restTemplate.exchange(
            "https://discord.com/api/users/@me",
            HttpMethod.GET,
            entity,
            DiscordUser.class
        );
        
        return response.getBody();
    }
    
    public record TokenResponse(String access_token, String token_type, long expires_in, 
                              String refresh_token, String scope) {}
    
    public record DiscordUser(String id, String username, String discriminator, 
                            String avatar, String email) {}
}