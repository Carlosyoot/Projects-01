package structure.api.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import structure.api.model.AnonUser;

public interface AnonUserRepository extends JpaRepository<AnonUser, String> {

    boolean existsById(String userId);

    List<AnonUser> findByOrgOneOrOrgTwoOrOrgThree(String orgOne, String orgTwo, String orgThree);
    
}
