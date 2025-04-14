    package structure.api.model;

    import java.time.LocalDateTime;

    import jakarta.persistence.Entity;
    import jakarta.persistence.Id;
    import jakarta.persistence.Table;
    import lombok.AllArgsConstructor;
    import lombok.Getter;
    import lombok.NoArgsConstructor;
    import lombok.Setter;

    @Entity
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Table(name = "AnonUser")
    public class AnonUser {


        @Id
        private String id;

        private LocalDateTime createdAt;

        private String orgOne;

        private String orgTwo;

        private String orgThree;
        
    }
