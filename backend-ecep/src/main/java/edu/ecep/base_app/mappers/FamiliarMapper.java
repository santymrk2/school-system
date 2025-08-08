package edu.ecep.base_app.mappers;

import edu.ecep.base_app.domain.Familiar;
import edu.ecep.base_app.dtos.FamiliarDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

/* ========== FAMILIAR ========== */
@Mapper(componentModel = "spring")
public interface FamiliarMapper {
    FamiliarDTO toDto(Familiar entity);

    Familiar toEntity(FamiliarDTO dto);

    @Mapping(target = "id", ignore = true)
    void updateEntityFromDto(FamiliarDTO dto, @MappingTarget Familiar entity);
}
