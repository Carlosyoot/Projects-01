package structure.api.service.hook;

import structure.api.service.hook.DiscordService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;
import jakarta.servlet.http.HttpSession;
import java.util.UUID;

@Controller
@RequestMapping("/auth/discord")
public class DiscordAuthController {
    
    @Autowired
    private DiscordAuthService authService;

    @Autowired
    private DiscordService discordService;
    
    public DiscordAuthController(DiscordAuthService authService, DiscordService discordService) {
        this.authService = authService;
        this.discordService = discordService;
    }
    
    @GetMapping("/connect")
    public RedirectView connectDiscord(
        @RequestParam("redirect") String redirectUri,
        HttpSession session) {
        String state = UUID.randomUUID().toString();
            
        session.setAttribute("discord_oauth_state", state);
        session.setAttribute("discord_oauth_redirect", redirectUri);
            
        System.out.println("Session ID no /connect: " + session.getId());
        System.out.println("State gerado: " + state);
            
        return new RedirectView(authService.getAuthorizationUrl(state));
}
    
    @GetMapping("/callback")
    public String handleCallback(
            @RequestParam String code,
            @RequestParam String state,
            HttpSession session
    ) {
        // Log do state recebido
        System.out.println("State recebido no callback: " + state);
        
        // Ou usando logger (recomendado para produção)
        // LoggerFactory.getLogger(DiscordAuthController.class).info("State recebido: {}", state);
    
        String sessionState = (String) session.getAttribute("discord_oauth_state");
        System.out.println("State armazenado na sessão: " + sessionState);
    
        if (sessionState == null || !sessionState.equals(state)) {
            System.err.println("Erro: State inválido. Esperado: " + sessionState + ", Recebido: " + state);
            throw new SecurityException("Invalid state parameter");
        }
    
        var discordUser = authService.exchangeCodeForUser(code);
        session.setAttribute("discord_user_id", discordUser.id());
    
        String redirectUri = (String) session.getAttribute("discord_oauth_redirect");
        System.out.println("Redirect URI armazenado: " + redirectUri);
    
        if (redirectUri != null && !redirectUri.isEmpty()) {
            String finalRedirect = "redirect:" + redirectUri + "?discordLinked=true&discordId=" + discordUser.id() + "&state=" + state;
            System.out.println("Redirecionando para: " + finalRedirect);
            return finalRedirect;
        }
    
        System.out.println("Redirecionando para fallback (/discord/linked)");
        return "redirect:/discord/linked";
    }
}
