package edu.ecep.base_app.identidad.infrastructure.mapper;

import org.mapstruct.*;
import edu.ecep.base_app.identidad.domain.Familiar;
import edu.ecep.base_app.identidad.presentation.dto.FamiliarDTO;
import edu.ecep.base_app.shared.mapper.ModelMapperConfig;
import edu.ecep.base_app.shared.mapper.RefMapper;

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
