package edu.ecep.base_app.repos;

import edu.ecep.base_app.domain.Alumno;
import edu.ecep.base_app.domain.InformeInicial;
import org.springframework.data.jpa.repository.JpaRepository;


public interface InformeInicialRepository extends JpaRepository<InformeInicial, Long> {
    boolean existsByTrimestreIdAndMatriculaId(Long trimestreId, Long matriculaId);
}
