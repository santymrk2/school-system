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
    @Mapping(target = "personalId", source = "personal.id")
    AsignacionDocenteSeccionDTO toDto(AsignacionDocenteSeccion e);

    @Mapping(target = "seccion", source = "seccionId")
    @Mapping(target = "personal", source = "personalId")
    AsignacionDocenteSeccion toEntity(AsignacionDocenteSeccionCreateDTO dto);

    @Mapping(target = "seccion", source = "seccionId")
    @Mapping(target = "personal", source = "personalId")
    void update(@MappingTarget AsignacionDocenteSeccion e, AsignacionDocenteSeccionDTO dto);
}
