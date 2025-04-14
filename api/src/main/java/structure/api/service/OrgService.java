package structure.api.service;

import java.util.Arrays;
import java.util.List;
import java.util.Objects;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import structure.api.model.AnonUser;
import structure.api.model.Org;
import structure.api.repository.AnonUserRepository;
import structure.api.repository.OrgRepository;

@Service
public class OrgService {

    @Autowired
    private OrgRepository orgRepository;

    @Autowired
    private AnonUserRepository anonUserRepository;

    public List<Org> buscarOrgsCriadasPor(String userId) {
        return orgRepository.findByCreatorId(userId);
    }

    @Transactional
    public Org criarOrganizacao(String userId, String orgId, String orgName) {
        if (!orgId.matches("^[a-zA-Z0-9-]+$")) {
            throw new IllegalArgumentException("ID da organização contém caracteres inválidos");
        }

        if (orgRepository.existsById(orgId)) {
            throw new IllegalArgumentException("ID da organização já está em uso");
        }

        AnonUser creator = anonUserRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Org org = new Org();
        org.setId(orgId);
        org.setName(orgName.trim());
        org.setCreator(creator);
        org.setMembers(1); 

        if (creator.getOrgOne() == null) {
            creator.setOrgOne(orgId);
        } else if (creator.getOrgTwo() == null) {
            creator.setOrgTwo(orgId);
        } else if (creator.getOrgThree() == null) {
            creator.setOrgThree(orgId);
        } else {
            throw new RuntimeException("Você atingiu o limite de 3 organizações");
        }

        anonUserRepository.save(creator);
        return orgRepository.save(org);
    }


    public Integer contarMembros(String orgId) {
        return orgRepository.findById(orgId)
                .map(Org::getMembers)
                .orElseThrow(() -> new RuntimeException("Org não encontrada"));
    }
    
    @Transactional
    public void adicionarMembro(String userId, String orgId) {
        AnonUser user = anonUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        Org org = orgRepository.findById(orgId)
                .orElseThrow(() -> new RuntimeException("Org não encontrada"));
    
        // Verifica se já é membro
        if (orgId.equals(user.getOrgOne()) || 
            orgId.equals(user.getOrgTwo()) || 
            orgId.equals(user.getOrgThree())) {
            throw new RuntimeException("Usuário já é membro");
        }
    
        if (user.getOrgOne() == null) {
            user.setOrgOne(orgId);
        } else if (user.getOrgTwo() == null) {
            user.setOrgTwo(orgId);
        } else if (user.getOrgThree() == null) {
            user.setOrgThree(orgId);
        } else {
            throw new RuntimeException("Limite de organizações atingido");
        }
    
        org.setMembers(org.getMembers() + 1);
        anonUserRepository.save(user);
        orgRepository.save(org);
    }

    public List<Org> listUserOrgs(String userId) {
        AnonUser user = anonUserRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        return orgRepository.findAllById(Arrays.asList(
            user.getOrgOne(),
            user.getOrgTwo(),
            user.getOrgThree()
        ).stream().filter(Objects::nonNull).toList());
    }

    @Transactional
    public void removerMembro(String userId, String orgId) {
        AnonUser user = anonUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        Org org = orgRepository.findById(orgId)
                .orElseThrow(() -> new RuntimeException("Organização não encontrada"));
        
        boolean wasMember = false;
        
        if (orgId.equals(user.getOrgOne())) {
            user.setOrgOne(null);
            wasMember = true;
        } else if (orgId.equals(user.getOrgTwo())) {
            user.setOrgTwo(null);
            wasMember = true;
        } else if (orgId.equals(user.getOrgThree())) {
            user.setOrgThree(null);
            wasMember = true;
        }
    
        if (!wasMember) {
            throw new RuntimeException("Usuário não é membro dessa organização");
        }
    
        org.setMembers(Math.max(org.getMembers() - 1, 0)); // Evita contagem negativa
    
        anonUserRepository.save(user);
        orgRepository.save(org);
}

    @Transactional
    public void deletarOrganizacao(String userId, String orgId) {
        Org org = orgRepository.findById(orgId)
            .orElseThrow(() -> new RuntimeException("Organização não encontrada"));
        
        if (!org.getCreator().getId().equals(userId)) {
            throw new RuntimeException("Apenas o criador pode deletar a organização");
        }
        
        List<AnonUser> members = anonUserRepository.findByOrgOneOrOrgTwoOrOrgThree(orgId, orgId, orgId);
        members.forEach(user -> {
            if (orgId.equals(user.getOrgOne())) user.setOrgOne(null);
            if (orgId.equals(user.getOrgTwo())) user.setOrgTwo(null);
            if (orgId.equals(user.getOrgThree())) user.setOrgThree(null);
        });
        
        anonUserRepository.saveAll(members);
        orgRepository.delete(org);
    }
    
    
}
