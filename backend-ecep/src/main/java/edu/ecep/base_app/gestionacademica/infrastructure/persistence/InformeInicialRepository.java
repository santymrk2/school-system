package edu.ecep.base_app.gestionacademica.infrastructure.persistence;

import edu.ecep.base_app.gestionacademica.domain.InformeInicial;
import edu.ecep.base_app.gestionacademica.domain.TrimestreEstado;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InformeInicialRepository extends JpaRepository<InformeInicial, Long> {
    boolean existsByTrimestreIdAndMatriculaId(Long trimestreId, Long matriculaId);

    List<InformeInicial> findByTrimestreEstado(TrimestreEstado estado);

    Optional<InformeInicial> findByIdAndTrimestreEstado(Long id, TrimestreEstado estado);
}
