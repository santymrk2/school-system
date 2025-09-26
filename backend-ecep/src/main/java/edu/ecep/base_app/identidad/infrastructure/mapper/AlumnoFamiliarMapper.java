package edu.ecep.base_app.identidad.infrastructure.mapper;

import edu.ecep.base_app.identidad.domain.AlumnoFamiliar;
import edu.ecep.base_app.identidad.presentation.dto.AlumnoFamiliarCreateDTO;
import edu.ecep.base_app.identidad.presentation.dto.AlumnoFamiliarDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import org.mapstruct.*;
import edu.ecep.base_app.shared.mapper.ModelMapperConfig;
import edu.ecep.base_app.shared.mapper.RefMapper;

@Mapper(config = ModelMapperConfig.class, uses = RefMapper.class)
public interface AlumnoFamiliarMapper {

    @Mapping(target = "alumnoId", source = "alumno.id")
    @Mapping(target = "familiarId", source = "familiar.id")
    AlumnoFamiliarDTO toDto(AlumnoFamiliar e);

    // CREATE
    @Mapping(target = "alumno", source = "alumnoId")
    @Mapping(target = "familiar", source = "familiarId")
    @Mapping(target = "convive", constant = "false")
    AlumnoFamiliar toEntity(AlumnoFamiliarCreateDTO dto);

    // UPDATE
    @Mapping(target = "alumno", source = "alumnoId")
    @Mapping(target = "familiar", source = "familiarId")
    @Mapping(target = "convive", ignore = true)
    @Mapping(target = "id", ignore = true)
    void update(@MappingTarget AlumnoFamiliar e, AlumnoFamiliarDTO dto);
}
