package structure.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "organizacao")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Org {

    @Id
    private String id;

    @NotBlank
    @Column(nullable = false)
    private String name; 

    @ManyToOne
    @JoinColumn(name = "creator_id", nullable = false)
    private AnonUser creator; 

    @Column(nullable = false)
    private Integer members = 0;

    //(se precisar de consultas)
    //@OneToMany(mappedBy = "orgOne")
    //private List<AnonUser> membersOrgOne;
    
}
