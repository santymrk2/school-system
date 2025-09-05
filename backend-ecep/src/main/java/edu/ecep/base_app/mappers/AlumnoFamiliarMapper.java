package edu.ecep.base_app.mappers;

import edu.ecep.base_app.domain.AlumnoFamiliar;
import edu.ecep.base_app.dtos.AlumnoFamiliarCreateDTO;
import edu.ecep.base_app.dtos.AlumnoFamiliarDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import org.mapstruct.*;

@Mapper(config = ModelMapperConfig.class, uses = RefMapper.class)
public interface AlumnoFamiliarMapper {

    @Mapping(target = "alumnoId", source = "alumno.id")
    @Mapping(target = "familiarId", source = "familiar.id")
    AlumnoFamiliarDTO toDto(AlumnoFamiliar e);

    // CREATE
    @Mapping(target = "alumno", source = "alumnoId")
    @Mapping(target = "familiar", source = "familiarId")
    AlumnoFamiliar toEntity(AlumnoFamiliarCreateDTO dto);

    // UPDATE
    @Mapping(target = "alumno", source = "alumnoId")
    @Mapping(target = "familiar", source = "familiarId")
    @Mapping(target = "id", ignore = true)
    void update(@MappingTarget AlumnoFamiliar e, AlumnoFamiliarDTO dto);
}
