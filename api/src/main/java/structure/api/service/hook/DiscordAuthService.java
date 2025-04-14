package structure.api.service.hook;

import structure.api.config.EnvConfig.DiscordConfig;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
public class DiscordAuthService {

    @Autowired
    private RestTemplate restTemplate;


    private final DiscordConfig config;
    
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
        
        // Verifique se as credenciais estão corretas
        System.out.println("Usando Client ID: " + config.clientId());
        System.out.println("Usando Client Secret: " + (config.clientSecret()));
        
        headers.setBasicAuth(config.clientId(), config.clientSecret());
    
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "authorization_code");
        body.add("code", code);
        body.add("redirect_uri", config.redirectUri());
        body.add("scope", "identify");
    
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
    
        try {
            System.out.println("Enviando requisição para Discord com body: " + body);
            ResponseEntity<TokenResponse> response = restTemplate.postForEntity(
                "https://discord.com/api/oauth2/token",
                request,
                TokenResponse.class
            );
    
            System.out.println("Resposta do Discord: " + response.getStatusCode());
            return response.getBody().access_token();
        } catch (HttpClientErrorException e) {
            System.err.println("Erro completo na resposta do Discord:");
            System.err.println("Status: " + e.getStatusCode());
            System.err.println("Headers: " + e.getResponseHeaders());
            System.err.println("Body: " + e.getResponseBodyAsString());
            throw e;
        }
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