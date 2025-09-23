package edu.ecep.base_app.vidaescolar.infrastructure.mapper;

import edu.ecep.base_app.vidaescolar.domain.MatriculaSeccionHistorial;
import edu.ecep.base_app.vidaescolar.presentation.dto.MatriculaSeccionHistorialCreateDTO;
import edu.ecep.base_app.vidaescolar.presentation.dto.MatriculaSeccionHistorialDTO;
import org.mapstruct.*;
import edu.ecep.base_app.shared.mapper.ModelMapperConfig;
import edu.ecep.base_app.shared.mapper.RefMapper;

@Mapper(config = ModelMapperConfig.class, uses = RefMapper.class)
public interface MatriculaSeccionHistorialMapper {
    @Mapping(target = "matriculaId", source = "matricula.id")
    @Mapping(target = "seccionId", source = "seccion.id")
    MatriculaSeccionHistorialDTO toDto(MatriculaSeccionHistorial e);

    @Mapping(target = "matricula", source = "matriculaId")
    @Mapping(target = "seccion", source = "seccionId")
    MatriculaSeccionHistorial toEntity(MatriculaSeccionHistorialCreateDTO dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "matricula", source = "matriculaId")
    @Mapping(target = "seccion", source = "seccionId")
    void update(@MappingTarget MatriculaSeccionHistorial entity, MatriculaSeccionHistorialDTO dto);
}
