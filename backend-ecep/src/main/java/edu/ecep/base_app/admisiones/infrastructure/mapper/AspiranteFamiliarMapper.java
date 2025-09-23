package edu.ecep.base_app.admisiones.infrastructure.mapper;

import edu.ecep.base_app.admisiones.domain.AspiranteFamiliar;
import edu.ecep.base_app.admisiones.presentation.dto.AspiranteFamiliarDTO;
import edu.ecep.base_app.shared.mapper.RefMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", uses = RefMapper.class, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface AspiranteFamiliarMapper {
    @Mapping(target = "aspiranteId", source = "aspirante.id")
    @Mapping(target = "familiarId", source = "familiar.id")
    AspiranteFamiliarDTO toDto(AspiranteFamiliar e);

    @Mapping(target = "aspirante", source = "aspiranteId")
    @Mapping(target = "familiar", source = "familiarId")
    AspiranteFamiliar toEntity(AspiranteFamiliarDTO dto);

    @Mapping(target = "id", ignore = true)
    void updateEntityFromDto(AspiranteFamiliarDTO dto, @MappingTarget AspiranteFamiliar entity);

}
