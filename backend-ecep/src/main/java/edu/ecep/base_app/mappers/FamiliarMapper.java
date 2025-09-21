package edu.ecep.base_app.mappers;

import org.mapstruct.*;
import edu.ecep.base_app.domain.Familiar;
import edu.ecep.base_app.dtos.FamiliarDTO;

@Mapper(config = ModelMapperConfig.class, uses = RefMapper.class)
public interface FamiliarMapper {

    @Mapping(target = "personaId", source = "persona.id")
    FamiliarDTO toDto(Familiar e);

    @Mapping(target = "id", source = "personaId")
    @Mapping(target = "persona", source = "personaId")
    Familiar toEntity(FamiliarDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "persona", source = "personaId")
    void update(@MappingTarget Familiar e, FamiliarDTO dto);
}
