package edu.ecep.base_app.vidaescolar.infrastructure.persistence;

import edu.ecep.base_app.identidad.domain.Alumno;
import edu.ecep.base_app.vidaescolar.domain.InformeInicial;
import org.springframework.data.jpa.repository.JpaRepository;


public interface InformeInicialRepository extends JpaRepository<InformeInicial, Long> {
    boolean existsByTrimestreIdAndMatriculaId(Long trimestreId, Long matriculaId);
}
