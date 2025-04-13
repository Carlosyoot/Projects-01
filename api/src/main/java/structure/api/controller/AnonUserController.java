package structure.api.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import structure.api.model.AnonUser;
import structure.api.repository.AnonUserRepository;

@RestController
@RequestMapping("api/users")
public class AnonUserController {

    @Autowired
    private AnonUserRepository anonUserRepository;


    @GetMapping
    public List<AnonUser> Respostaget(){

        return anonUserRepository.findAll();
        
    }

    @PostMapping("/anon")
     public ResponseEntity<?> createIfNotExists(@RequestBody Map<String, String> body) {
        try{
        String userId = body.get("userId");

        if (!anonUserRepository.existsById(userId)) {
            AnonUser user = new AnonUser();
            user.setId(userId);
            user.setCreatedAt(LocalDateTime.now());
            anonUserRepository.save(user);
        }

        return ResponseEntity.ok().build();
        }
        catch(Exception exception){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Erro:" + exception);
        }
    }
}
