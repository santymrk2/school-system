package edu.ecep.base_app.mappers;

import org.mapstruct.*;
import edu.ecep.base_app.domain.Aspirante;
import edu.ecep.base_app.dtos.AspiranteDTO;

@Mapper(config = ModelMapperConfig.class, uses = RefMapper.class)
public interface AspiranteMapper {

    @Mapping(target = "personaId", source = "persona.id")
    AspiranteDTO toDto(Aspirante e);

    @Mapping(target = "persona", source = "personaId")
    Aspirante toEntity(AspiranteDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "persona", source = "personaId")
    void update(@MappingTarget Aspirante e, AspiranteDTO dto);
}
