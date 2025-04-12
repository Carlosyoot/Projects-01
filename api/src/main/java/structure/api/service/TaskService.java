package structure.api.service;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import structure.api.model.Task;
import structure.api.repository.TaskRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {
    
    @Autowired
    private TaskRepository taskRepository;

    @Transactional(readOnly = true)
    public List<Task> findAllTasks() {
        return taskRepository.findAll();
    }
    
    @Transactional(readOnly = true)
    public Task findTaskById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));
    }
    
    @Transactional
    public Task createTask(Task task) {
        task.setCreatedAt(LocalDateTime.now());
        return taskRepository.save(task);
    }
    
    @Transactional
    public Task updateTask(Long id, Task taskDetails) {
        Task existingTask = findTaskById(id);
        
        existingTask.setTitle(taskDetails.getTitle());
        existingTask.setDetails(taskDetails.getDetails());
        existingTask.setFinished(taskDetails.isFinished());
        existingTask.setUpdatedAt(LocalDateTime.now());
        
        return taskRepository.save(existingTask);
    }
    
    @Transactional
    public void deleteTask(Long id) {
        Task task = findTaskById(id);
        taskRepository.delete(task);
    }
    
    @Transactional
    public Task markAsFinished(Long id) {
        Task task = findTaskById(id);
        task.setFinished(true);
        task.setUpdatedAt(LocalDateTime.now());
        return taskRepository.save(task);
    }
    
    @Transactional(readOnly = true)
    public List<Task> findFinishedTasks() {
        return taskRepository.findByFinishedTrue();
    }
    
    @Transactional(readOnly = true)
    public List<Task> findPendingTasks() {
        return taskRepository.findByFinishedFalse();
    }
}