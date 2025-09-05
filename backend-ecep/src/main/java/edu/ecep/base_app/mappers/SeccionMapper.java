package edu.ecep.base_app.mappers;

import edu.ecep.base_app.domain.Seccion;
import edu.ecep.base_app.dtos.SeccionCreateDTO;
import edu.ecep.base_app.dtos.SeccionDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(config = ModelMapperConfig.class, uses = RefMapper.class)
public interface SeccionMapper {
    @Mapping(target = "periodoEscolarId", source = "periodoEscolar.id")
    SeccionDTO toDto(Seccion e);

    @Mapping(target = "periodoEscolar", source = "periodoEscolarId")
    Seccion toEntity(SeccionCreateDTO dto);

    @Mapping(target = "periodoEscolar", source = "periodoEscolarId")
    void update(@MappingTarget Seccion e, SeccionDTO dto);
}
