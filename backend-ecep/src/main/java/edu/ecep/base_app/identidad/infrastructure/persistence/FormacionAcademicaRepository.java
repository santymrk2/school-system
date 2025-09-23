package edu.ecep.base_app.identidad.infrastructure.persistence;

import edu.ecep.base_app.identidad.domain.FormacionAcademica;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FormacionAcademicaRepository extends JpaRepository<FormacionAcademica, Long> {}
