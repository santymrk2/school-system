package edu.ecep.base_app.mappers;

import org.mapstruct.*;
import edu.ecep.base_app.domain.Familiar;
import edu.ecep.base_app.dtos.FamiliarDTO;

@Mapper(config = ModelMapperConfig.class, uses = RefMapper.class)
public interface FamiliarMapper {

    @Mapping(target = "personaId", source = "persona.id")
    FamiliarDTO toDto(Familiar e);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "persona", ignore = true)
    Familiar toEntity(FamiliarDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "persona", ignore = true)
    void update(@MappingTarget Familiar e, FamiliarDTO dto);
}
