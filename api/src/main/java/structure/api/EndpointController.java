package structure.api;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;


@Controller
public class EndpointController {

    @GetMapping("/")
    public String returnHomePage() {
        return "/pages/home";
    }
    
    
}
