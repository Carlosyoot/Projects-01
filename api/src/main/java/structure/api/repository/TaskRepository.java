package structure.api.repository;
import structure.api.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    
    List<Task> findByOwner(String userId);

    List<Task> findByOrganizationIdIn(List<String> orgIds);
    
    List<Task> findByFinishedTrue();
    List<Task> findByFinishedFalse();
}