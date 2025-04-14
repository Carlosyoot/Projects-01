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
    public RedirectView connectDiscord(HttpSession session) {

        String state = UUID.randomUUID().toString();
        session.setAttribute("discord_oauth_state", state);
        
        return new RedirectView(authService.getAuthorizationUrl(state));
    }
    
    @GetMapping("/callback")
    public String handleCallback(
            @RequestParam String code,
            @RequestParam String state,
            HttpSession session) {
        
        String sessionState = (String) session.getAttribute("discord_oauth_state");
        if (sessionState == null || !sessionState.equals(state)) {
            throw new SecurityException("Invalid state parameter");
        }

        var discordUser = authService.exchangeCodeForUser(code);
        
        session.setAttribute("discord_user_id", discordUser.id());
        
        return "redirect:/discord/linked"; 
    }
}