package edu.ecep.base_app.mappers;

import edu.ecep.base_app.domain.AspiranteFamiliar;
import edu.ecep.base_app.domain.Comunicado;
import edu.ecep.base_app.domain.Licencia;
import edu.ecep.base_app.dtos.AspiranteFamiliarDTO;
import edu.ecep.base_app.dtos.ComunicadoDTO;
import edu.ecep.base_app.dtos.LicenciaDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

// package edu.ecep.base_app.mappers;

import edu.ecep.base_app.dtos.AspiranteFamiliarDTO;
import edu.ecep.base_app.domain.AspiranteFamiliar;
import org.mapstruct.*;

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
