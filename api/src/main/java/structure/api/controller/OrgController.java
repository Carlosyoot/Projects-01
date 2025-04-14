package structure.api.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import structure.api.model.Org;
import structure.api.service.OrgService;

@RestController
@RequestMapping("/api/orgs")
@RequiredArgsConstructor
public class OrgController {

    @Autowired
    private OrgService orgService;


    @PostMapping
    public ResponseEntity<Org> criarOrganizacao(
            @RequestHeader("X-User-Id") String userId,
            @RequestBody @Valid CriarOrgRequest request) {
            
        Org org = orgService.criarOrganizacao(
            userId, 
            request.getOrgId(), 
            request.getName()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(org);
    }

    @GetMapping("/{orgId}/members")
    public ResponseEntity<Integer> contarMembros(@PathVariable String orgId) {
        return ResponseEntity.ok(orgService.contarMembros(orgId));
    }

    @PostMapping("/join/{orgId}")
    public ResponseEntity<Void> entrarNaOrganizacao(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String orgId) {
        
        orgService.adicionarMembro(userId, orgId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Org>> getUserOrgs(@PathVariable String userId) {
        return ResponseEntity.ok(orgService.listUserOrgs(userId));
    }

    @DeleteMapping("/{orgId}")
    public ResponseEntity<Void> deletarOrganizacao(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String orgId) {
        orgService.deletarOrganizacao(userId, orgId);
        return ResponseEntity.noContent().build();
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class CriarOrgRequest {
        @NotBlank
        @Size(min = 3, max = 50)
        @Pattern(regexp = "^[\\p{L}0-9\\s]+$") 
        private String name;

        @NotBlank
        @Pattern(regexp = "^[a-zA-Z0-9-]+$") 
        private String orgId;
    }
}
