package edu.ecep.base_app.mappers;

import edu.ecep.base_app.domain.Aspirante;
import edu.ecep.base_app.dtos.AspiranteDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

/* ========== ASPIRANTE ========== */
@Mapper(componentModel = "spring")
public interface AspiranteMapper {
    AspiranteDTO toDto(Aspirante entity);

    Aspirante toEntity(AspiranteDTO dto);

    @Mapping(target = "id", ignore = true)
    void updateEntityFromDto(AspiranteDTO dto, @MappingTarget Aspirante entity);
}
