package edu.ecep.base_app.repos;

import edu.ecep.base_app.domain.Materia;
import edu.ecep.base_app.domain.Personal;
import edu.ecep.base_app.domain.Seccion;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import edu.ecep.base_app.domain.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;


public interface PersonalRepository extends JpaRepository<Personal, Long> {

    boolean existsByUsuarioId(Long id);

    Optional<Personal> findByUsuario(Usuario usuario);

    boolean existsByUsuario(Usuario u);
}
