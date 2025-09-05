package edu.ecep.base_app.mappers;

import edu.ecep.base_app.domain.SolicitudAdmision;
import edu.ecep.base_app.dtos.SolicitudAdmisionDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import org.mapstruct.*;

@Mapper(componentModel = "spring", uses = RefMapper.class, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface SolicitudAdmisionMapper {

    @Mapping(target = "aspiranteId", source = "aspirante.id")
    SolicitudAdmisionDTO toDto(SolicitudAdmision e);

    @Mapping(target = "aspirante", source = "aspiranteId")
    SolicitudAdmision toEntity(SolicitudAdmisionDTO dto);

    // ⬇⬇⬇ FIX: @MappingTarget + mapping de aspiranteId → aspirante en update
    @Mapping(target = "aspirante", source = "aspiranteId")
    @Mapping(target = "id", ignore = true)
    void updateEntityFromDto(SolicitudAdmisionDTO dto, @MappingTarget SolicitudAdmision entity);
}
