package edu.ecep.base_app.mappers;

import edu.ecep.base_app.domain.AspiranteFamiliar;
import edu.ecep.base_app.dtos.AspiranteFamiliarDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

/* ========== ASPIRANTE FAMILIAR ========== */
@Mapper(componentModel = "spring")
public interface AspiranteFamiliarMapper {
    @Mapping(source = "aspirante.id", target = "aspiranteId")
    @Mapping(source = "familiar.id", target = "familiarId")
    AspiranteFamiliarDTO toDto(AspiranteFamiliar entity);

    @Mapping(target = "aspirante", ignore = true)
    @Mapping(target = "familiar", ignore = true)
    AspiranteFamiliar toEntity(AspiranteFamiliarDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "aspirante", ignore = true)
    @Mapping(target = "familiar", ignore = true)
    void updateEntityFromDto(AspiranteFamiliarDTO dto, @MappingTarget AspiranteFamiliar entity);
}
