package edu.ecep.base_app.mappers;

import edu.ecep.base_app.domain.DiaNoHabil;
import edu.ecep.base_app.dtos.DiaNoHabilCreateDTO;
import edu.ecep.base_app.dtos.DiaNoHabilDTO;
import org.mapstruct.Mapper;

import org.mapstruct.*;

@Mapper(config = ModelMapperConfig.class)
public interface DiaNoHabilMapper {
    DiaNoHabilDTO toDto(DiaNoHabil e);
    DiaNoHabil toEntity(DiaNoHabilDTO dto);

    @Mapping(target = "id", ignore = true)
    void update(@MappingTarget DiaNoHabil e, DiaNoHabilDTO dto);
}
