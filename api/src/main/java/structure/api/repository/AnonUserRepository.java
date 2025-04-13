package structure.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import structure.api.model.AnonUser;

public interface AnonUserRepository extends JpaRepository<AnonUser, String> {

    boolean existsById(String userId);
    
}
