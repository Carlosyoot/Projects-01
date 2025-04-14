package structure.api.service;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import structure.api.model.AnonUser;
import structure.api.model.Task;
import structure.api.repository.AnonUserRepository;
import structure.api.repository.TaskRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {
    
    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private AnonUserRepository anonUserRepository;

    @Transactional(readOnly = true)
    public List<Task> findAllTasks() {
        return taskRepository.findAll();
    }
    
    @Transactional(readOnly = true)
    public Task findTaskById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<Task> findUserAndOrgTasks(String userId) {
        List<Task> personalTasks = taskRepository.findByOwner(userId);

        AnonUser anonUser = anonUserRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Usuário anônimo não encontrado"));

        List<String> orgIds = new ArrayList<>();
        if (anonUser.getOrgOne() != null) orgIds.add(anonUser.getOrgOne());
        if (anonUser.getOrgTwo() != null) orgIds.add(anonUser.getOrgTwo());
        if (anonUser.getOrgThree() != null) orgIds.add(anonUser.getOrgThree());

        List<Task> orgTasks = orgIds.isEmpty() ? List.of() : taskRepository.findByOrganizationIdIn(orgIds);

        List<Task> allTasks = new ArrayList<>();
        allTasks.addAll(personalTasks);
        allTasks.addAll(orgTasks);

        return allTasks;
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