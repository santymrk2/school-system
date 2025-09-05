package edu.ecep.base_app.mappers;

import edu.ecep.base_app.domain.Aspirante;
import edu.ecep.base_app.dtos.AspiranteDTO;
import org.mapstruct.Mapper;
import org.mapstruct.*;

@Mapper(config = ModelMapperConfig.class)
public interface AspiranteMapper {
    AspiranteDTO toDto(Aspirante e);
    Aspirante toEntity(AspiranteDTO dto);

    @Mapping(target = "id", ignore = true)
    void update(@MappingTarget Aspirante e, AspiranteDTO dto);
}