package edu.ecep.base_app.mappers;

import edu.ecep.base_app.domain.Matricula;
import edu.ecep.base_app.dtos.MatriculaDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

/* ========== MATRÍCULA ========== */
@Mapper(componentModel = "spring")
public interface MatriculaMapper {
    @Mapping(source = "alumno.id", target = "alumnoId")
    @Mapping(source = "seccion.id", target = "seccionId")
    MatriculaDTO toDto(Matricula entity);

    @Mapping(target = "alumno", ignore = true)
    @Mapping(target = "seccion", ignore = true)
    Matricula toEntity(MatriculaDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "alumno", ignore = true)
    @Mapping(target = "seccion", ignore = true)
    void updateEntityFromDto(MatriculaDTO dto, @MappingTarget Matricula entity);
}
