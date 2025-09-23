package edu.ecep.base_app.finanzas.infrastructure.persistence;

import edu.ecep.base_app.finanzas.domain.EmisionCuota;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmisionCuotaRepository extends JpaRepository<EmisionCuota, Long> {}
