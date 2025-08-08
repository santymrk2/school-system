package edu.ecep.base_app.mappers;

import edu.ecep.base_app.domain.SolicitudAdmision;
import edu.ecep.base_app.dtos.SolicitudAdmisionDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

/* ========== SOLICITUD ADMISIÓN ========== */
@Mapper(componentModel = "spring")
public interface SolicitudAdmisionMapper {
    @Mapping(source = "aspirante.id", target = "aspiranteId")
    SolicitudAdmisionDTO toDto(SolicitudAdmision entity);

    @Mapping(target = "aspirante", ignore = true)
    SolicitudAdmision toEntity(SolicitudAdmisionDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "aspirante", ignore = true)
    void updateEntityFromDto(SolicitudAdmisionDTO dto, @MappingTarget SolicitudAdmision entity);
}
