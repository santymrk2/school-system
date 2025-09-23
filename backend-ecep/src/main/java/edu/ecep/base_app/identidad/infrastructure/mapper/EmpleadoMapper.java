package edu.ecep.base_app.identidad.infrastructure.mapper;

import edu.ecep.base_app.identidad.domain.Empleado;
import org.mapstruct.*;
import edu.ecep.base_app.identidad.presentation.dto.EmpleadoDTO;
import edu.ecep.base_app.shared.mapper.ModelMapperConfig;
import edu.ecep.base_app.shared.mapper.RefMapper;

@Mapper(config = ModelMapperConfig.class, uses = RefMapper.class)
public interface EmpleadoMapper {

    @Mapping(target = "personaId", source = "persona.id")
    EmpleadoDTO toDto(Empleado e);

    @Mapping(target = "persona", source = "personaId")
    Empleado toEntity(EmpleadoDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "persona", source = "personaId")
    void update(@MappingTarget Empleado entity, EmpleadoDTO dto);
}

