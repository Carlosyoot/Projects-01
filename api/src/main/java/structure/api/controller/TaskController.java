package structure.api.controller;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import structure.api.model.Task;
import structure.api.service.TaskService;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {
    
    @Autowired
    private TaskService taskService;

    @GetMapping
    public ResponseEntity<List<Task>> getAllTasks() {
        return ResponseEntity.ok(taskService.findAllTasks());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Task> getTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.findTaskById(id));
    }
    
    @GetMapping("/user-and-org/{userId}")
    public ResponseEntity<List<Task>> getUserAndOrgTasks(@PathVariable String userId) {
        return ResponseEntity.ok(taskService.findUserAndOrgTasks(userId));
    }
    
    @PostMapping
    public ResponseEntity<Task> createTask(@Valid @RequestBody Task task) {
        Task createdTask = taskService.createTask(task);
        return ResponseEntity.created(URI.create("/api/tasks/" + createdTask.getId()))
                .body(createdTask);
    }

    @PostMapping("/org")
    public ResponseEntity<Task> createOrgTask(@Valid @RequestBody Task task) {
        if (task.getOrganizationId() == null || task.getOrganizationId().isBlank()) {
            throw new IllegalArgumentException("organizationId é obrigatório para tarefas organizacionais");
        }
    
        Task createdTask = taskService.createTask(task);
        return ResponseEntity.created(URI.create("/api/tasks/" + createdTask.getId()))
                .body(createdTask);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(
            @PathVariable Long id,
            @RequestBody Task taskDetails) {
        return ResponseEntity.ok(taskService.updateTask(id, taskDetails));
    }
    
    @PatchMapping("/{id}/finish")
    public ResponseEntity<Task> markTaskAsFinished(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.markAsFinished(id));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/finished")
    public ResponseEntity<List<Task>> getFinishedTasks() {
        return ResponseEntity.ok(taskService.findFinishedTasks());
    }
    
    @GetMapping("/pending")
    public ResponseEntity<List<Task>> getPendingTasks() {
        return ResponseEntity.ok(taskService.findPendingTasks());
    }
}