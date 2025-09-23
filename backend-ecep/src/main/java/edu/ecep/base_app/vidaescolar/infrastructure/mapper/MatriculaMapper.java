package edu.ecep.base_app.vidaescolar.infrastructure.mapper;

import edu.ecep.base_app.vidaescolar.domain.Matricula;
import edu.ecep.base_app.vidaescolar.presentation.dto.MatriculaCreateDTO;
import edu.ecep.base_app.vidaescolar.presentation.dto.MatriculaDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import edu.ecep.base_app.shared.mapper.ModelMapperConfig;
import edu.ecep.base_app.shared.mapper.RefMapper;

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
