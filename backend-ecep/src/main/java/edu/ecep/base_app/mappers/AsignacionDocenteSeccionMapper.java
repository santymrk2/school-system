package edu.ecep.base_app.mappers;

import edu.ecep.base_app.domain.AsignacionDocenteSeccion;
import edu.ecep.base_app.dtos.AsignacionDocenteSeccionCreateDTO;
import edu.ecep.base_app.dtos.AsignacionDocenteSeccionDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(config = ModelMapperConfig.class, uses = RefMapper.class)
public interface AsignacionDocenteSeccionMapper {
    @Mapping(target = "seccionId", source = "seccion.id")
    @Mapping(target = "empleadoId", source = "empleado.id")
    AsignacionDocenteSeccionDTO toDto(AsignacionDocenteSeccion e);

    @Mapping(target = "seccion", source = "seccionId")
    @Mapping(target = "empleado", source = "empleadoId")
    AsignacionDocenteSeccion toEntity(AsignacionDocenteSeccionCreateDTO dto);

    @Mapping(target = "seccion", source = "seccionId")
    @Mapping(target = "empleado", source = "empleadoId")
    void update(@MappingTarget AsignacionDocenteSeccion e, AsignacionDocenteSeccionDTO dto);
}
