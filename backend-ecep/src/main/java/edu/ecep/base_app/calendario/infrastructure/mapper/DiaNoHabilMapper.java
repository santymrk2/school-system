package edu.ecep.base_app.calendario.infrastructure.mapper;

import edu.ecep.base_app.calendario.domain.DiaNoHabil;
import edu.ecep.base_app.calendario.presentation.dto.DiaNoHabilCreateDTO;
import edu.ecep.base_app.calendario.presentation.dto.DiaNoHabilDTO;
import org.mapstruct.Mapper;

import org.mapstruct.*;
import edu.ecep.base_app.shared.mapper.ModelMapperConfig;

@Mapper(config = ModelMapperConfig.class)
public interface DiaNoHabilMapper {
    DiaNoHabilDTO toDto(DiaNoHabil e);
    DiaNoHabil toEntity(DiaNoHabilDTO dto);

    @Mapping(target = "id", ignore = true)
    void update(@MappingTarget DiaNoHabil e, DiaNoHabilDTO dto);
}
