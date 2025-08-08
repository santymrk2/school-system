package edu.ecep.base_app.mappers;

import edu.ecep.base_app.domain.AsignacionDocente;
import edu.ecep.base_app.dtos.AsignacionDocenteDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

/* ========== ASIGNACIÓN DOCENTE ========== */
@Mapper(componentModel = "spring")
public interface AsignacionDocenteMapper {
    @Mapping(source = "docente.id", target = "personalId")
    @Mapping(source = "seccion.id", target = "seccionId")
    @Mapping(source = "materia.id", target = "materiaId")
    AsignacionDocenteDTO toDto(AsignacionDocente entity);

    @Mapping(target = "docente", ignore = true)
    @Mapping(target = "seccion", ignore = true)
    @Mapping(target = "materia", ignore = true)
    AsignacionDocente toEntity(AsignacionDocenteDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "docente", ignore = true)
    @Mapping(target = "seccion", ignore = true)
    @Mapping(target = "materia", ignore = true)
    void updateEntityFromDto(AsignacionDocenteDTO dto, @MappingTarget AsignacionDocente entity);
}
