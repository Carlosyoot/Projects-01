package structure.api.service;

import org.springframework.stereotype.Service;

import structure.api.model.Task;
import structure.api.repository.TaskRepository;

import java.util.List;
import java.util.Optional;

@Service
public class TaskService {
    private final TaskRepository taskRepository;
    
    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }
    
    public List<Task> findAll() {
        return taskRepository.findAll();
    }
    
    public Task save(Task task) {
        return taskRepository.save(task);
    }
    
    public Optional<Task> findById(Long id) {
        return taskRepository.findById(id);
    }
    
    public void deleteById(Long id) {
        taskRepository.deleteById(id);
    }
    
    public Task update(Long id, Task taskDetails) {
        return taskRepository.findById(id)
            .map(task -> {
                task.setMessage(taskDetails.getMessage());
                task.setFinished(taskDetails.isFinished());
                return taskRepository.save(task);
            })
            .orElseThrow(() -> new RuntimeException("Task not found with id " + id));
    }
}
