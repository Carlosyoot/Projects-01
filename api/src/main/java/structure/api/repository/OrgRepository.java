package structure.api.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import structure.api.model.Org;

public interface OrgRepository extends JpaRepository<Org, String>{

    List<Org> findByCreatorId(String creatorId);
    
}
