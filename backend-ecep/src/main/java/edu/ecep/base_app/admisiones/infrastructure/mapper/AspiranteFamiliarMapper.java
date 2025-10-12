package edu.ecep.base_app.admisiones.infrastructure.mapper;

import edu.ecep.base_app.admisiones.domain.AspiranteFamiliar;
import edu.ecep.base_app.admisiones.presentation.dto.AspiranteFamiliarDTO;
import edu.ecep.base_app.shared.domain.enums.RolVinculo;
import edu.ecep.base_app.shared.mapper.RefMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", uses = RefMapper.class, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface AspiranteFamiliarMapper {
    @Mapping(target = "aspiranteId", source = "aspirante.id")
    @Mapping(target = "familiarId", source = "familiar.id")
    @Mapping(
            target = "parentesco",
            source = "rolVinculo",
            qualifiedByName = "rolVinculoToParentesco")
    AspiranteFamiliarDTO toDto(AspiranteFamiliar e);

    @Mapping(target = "aspirante", source = "aspiranteId")
    @Mapping(target = "familiar", source = "familiarId")
    @Mapping(
            target = "rolVinculo",
            source = "parentesco",
            qualifiedByName = "parentescoToRolVinculo")
    AspiranteFamiliar toEntity(AspiranteFamiliarDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(
            target = "rolVinculo",
            source = "parentesco",
            qualifiedByName = "parentescoToRolVinculo")
    void updateEntityFromDto(AspiranteFamiliarDTO dto, @MappingTarget AspiranteFamiliar entity);

    @Named("rolVinculoToParentesco")
    default String mapRolVinculoToParentesco(RolVinculo rolVinculo) {
        return rolVinculo != null ? rolVinculo.name() : null;
    }

    @Named("parentescoToRolVinculo")
    default RolVinculo mapParentescoToRolVinculo(String parentesco) {
        if (parentesco == null || parentesco.isBlank()) {
            return null;
        }
        try {
            return RolVinculo.valueOf(parentesco);
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

}
