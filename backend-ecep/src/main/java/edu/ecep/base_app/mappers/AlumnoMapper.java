package edu.ecep.base_app.mappers;

import edu.ecep.base_app.domain.Alumno;
import edu.ecep.base_app.dtos.AlumnoDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

/* ========== ALUMNO ========== */
@Mapper(componentModel = "spring")
public interface AlumnoMapper {
    AlumnoDTO toDto(Alumno entity);

    Alumno toEntity(AlumnoDTO dto);

    @Mapping(target = "id", ignore = true)
    void updateEntityFromDto(AlumnoDTO dto, @MappingTarget Alumno entity);
}
