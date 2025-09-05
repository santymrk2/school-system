package edu.ecep.base_app.mappers;

import edu.ecep.base_app.domain.MatriculaSeccionHistorial;
import edu.ecep.base_app.dtos.MatriculaSeccionHistorialCreateDTO;
import edu.ecep.base_app.dtos.MatriculaSeccionHistorialDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(config = ModelMapperConfig.class, uses = RefMapper.class)
public interface MatriculaSeccionHistorialMapper {
    @Mapping(target = "matriculaId", source = "matricula.id")
    @Mapping(target = "seccionId", source = "seccion.id")
    MatriculaSeccionHistorialDTO toDto(MatriculaSeccionHistorial e);

    @Mapping(target = "matricula", source = "matriculaId")
    @Mapping(target = "seccion", source = "seccionId")
    MatriculaSeccionHistorial toEntity(MatriculaSeccionHistorialCreateDTO dto);
}
