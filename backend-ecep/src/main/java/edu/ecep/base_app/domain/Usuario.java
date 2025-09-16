package edu.ecep.base_app.domain;

import edu.ecep.base_app.domain.enums.UserRole;
import jakarta.persistence.*;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import static jakarta.persistence.FetchType.EAGER;
import static jakarta.persistence.GenerationType.IDENTITY;


@Entity @Table(name = "usuarios")
@SQLDelete(sql = "UPDATE usuarios SET activo = false, fecha_eliminacion = now() WHERE id = ?")
@Getter
@Setter
public class Usuario extends BaseEntity  {
    @OneToOne(mappedBy = "usuario", fetch = FetchType.LAZY)
    private Persona persona;

    @Column(unique = true, nullable = false) private String email;

    @Column(nullable = false) private String password;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name="usuario_roles", joinColumns=@JoinColumn(name="usuario_id"))
    @Column(name="rol")
    @Enumerated(EnumType.STRING)
    private Set<UserRole> roles = new HashSet<>();

    public Set<UserRole> getUserRoles() { return getRoles(); }
    public void setUserRoles(Set<UserRole> roles) { setRoles(roles); }

    public Collection<? extends GrantedAuthority> getAuthorities() {
        return this.roles.stream()
                .map(r -> new SimpleGrantedAuthority("ROLE_" + r.name()))
                .toList();
    }
}
