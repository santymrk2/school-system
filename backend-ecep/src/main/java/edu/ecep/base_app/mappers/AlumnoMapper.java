package edu.ecep.base_app.mappers;

import edu.ecep.base_app.domain.Alumno;
import edu.ecep.base_app.dtos.AlumnoDTO;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import org.mapstruct.*;

@Mapper(config = ModelMapperConfig.class)
public interface AlumnoMapper {
    AlumnoDTO toDto(Alumno e);
    Alumno toEntity(AlumnoDTO dto);

    @Mapping(target = "id", ignore = true)
    void update(@MappingTarget Alumno e, AlumnoDTO dto);
}
