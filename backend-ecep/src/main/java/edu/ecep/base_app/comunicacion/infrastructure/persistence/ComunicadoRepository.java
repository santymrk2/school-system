package edu.ecep.base_app.comunicacion.infrastructure.persistence;

import edu.ecep.base_app.comunicacion.domain.Comunicado;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ComunicadoRepository extends MongoRepository<Comunicado, String> {
    List<Comunicado> findByActivoTrueOrderByDateCreatedDesc();
    Optional<Comunicado> findByIdAndActivoTrue(String id);
}
