package edu.ecep.base_app.mappers;

import edu.ecep.base_app.domain.Matricula;
import edu.ecep.base_app.dtos.MatriculaCreateDTO;
import edu.ecep.base_app.dtos.MatriculaDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(config = ModelMapperConfig.class, uses = RefMapper.class)
public interface MatriculaMapper {
    @Mapping(target = "alumnoId", source = "alumno.id")
    @Mapping(target = "periodoEscolarId", source = "periodoEscolar.id")
    MatriculaDTO toDto(Matricula e);

    @Mapping(target = "alumno", source = "alumnoId")
    @Mapping(target = "periodoEscolar", source = "periodoEscolarId")
    Matricula toEntity(MatriculaCreateDTO dto);

    @Mapping(target = "alumno", source = "alumnoId")
    @Mapping(target = "periodoEscolar", source = "periodoEscolarId")
    void update(@MappingTarget Matricula e, MatriculaDTO dto);
}
