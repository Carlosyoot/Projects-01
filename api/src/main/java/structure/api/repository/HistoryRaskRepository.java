package structure.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import structure.api.model.HistoryTask;

@Repository
public interface HistoryRaskRepository extends JpaRepository<HistoryTask, Long> {
    
}
