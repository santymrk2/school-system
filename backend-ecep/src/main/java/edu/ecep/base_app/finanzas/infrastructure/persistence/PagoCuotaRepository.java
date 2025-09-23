package edu.ecep.base_app.finanzas.infrastructure.persistence;

import edu.ecep.base_app.finanzas.domain.PagoCuota;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PagoCuotaRepository extends JpaRepository<PagoCuota, Long> {}
