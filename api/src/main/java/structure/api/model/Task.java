package structure.api.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "Tasks")
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(length = 1000)
    private String details;
    
    
    @Column(name = "created", nullable = false, updatable = false, columnDefinition = "TIMESTAMP(0)")
    private LocalDateTime createdAt;
    
    @Column(name = "modified", columnDefinition = "TIMESTAMP(0)")
    private LocalDateTime updatedAt;

    @Column(nullable = false)
    private boolean finished;
    
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    // Builder pattern customization for required fields
    public static TaskBuilder builder(String message, boolean finished) {
        return new TaskBuilder()
                .details(message)
                .finished(finished)
                .createdAt(LocalDateTime.now());
    }
}