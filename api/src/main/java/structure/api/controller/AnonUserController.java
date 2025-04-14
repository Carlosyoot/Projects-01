package structure.api.controller;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import structure.api.model.AnonUser;
import structure.api.model.Org;
import structure.api.repository.AnonUserRepository;
import structure.api.repository.OrgRepository;

@RestController
@RequestMapping("api/users")
public class AnonUserController {

    @Autowired
    private AnonUserRepository anonUserRepository;

    @Autowired 
    private OrgRepository orgRepository;


    @GetMapping
    public List<AnonUser> Respostaget(){

        return anonUserRepository.findAll();
        
    }

    @GetMapping("/can-create-org")
    public ResponseEntity<Boolean> canUserCreateOrg(@RequestHeader("X-User-Id") String userId) {
        AnonUser user = anonUserRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        boolean canCreate = user.getOrgOne() == null || 
                          user.getOrgTwo() == null || 
                          user.getOrgThree() == null;
        
        return ResponseEntity.ok(canCreate);
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

    @GetMapping("/{userId}/orgs")
    public ResponseEntity<List<Org>> getUserOrgs(@PathVariable String userId) {
    AnonUser user = anonUserRepository.findById(userId)
        .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    
    List<String> orgIds = Arrays.asList(
        user.getOrgOne(),
        user.getOrgTwo(),
        user.getOrgThree()
    ).stream().filter(Objects::nonNull).toList();
    
    List<Org> orgs = orgRepository.findAllById(orgIds);
    
    return ResponseEntity.ok(orgs);
}
}
