package edu.ecep.base_app.mappers;

import edu.ecep.base_app.domain.Familiar;
import edu.ecep.base_app.dtos.FamiliarCreateDTO;
import edu.ecep.base_app.dtos.FamiliarDTO;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import org.mapstruct.*;

@Mapper(config = ModelMapperConfig.class)
public interface FamiliarMapper {
    FamiliarDTO toDto(Familiar e);
    Familiar toEntity(FamiliarDTO dto);

    @Mapping(target = "id", ignore = true)
    void update(@MappingTarget Familiar e, FamiliarDTO dto);
}
