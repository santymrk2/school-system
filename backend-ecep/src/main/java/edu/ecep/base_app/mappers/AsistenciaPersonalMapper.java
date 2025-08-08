package edu.ecep.base_app.mappers;

import edu.ecep.base_app.domain.AsistenciaPersonal;
import edu.ecep.base_app.dtos.AsistenciaPersonalDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

/* ========== ASISTENCIA PERSONAL ========== */
@Mapper(componentModel = "spring")
public interface AsistenciaPersonalMapper {
    @Mapping(source = "personal.id", target = "personalId")
    AsistenciaPersonalDTO toDto(AsistenciaPersonal entity);

    @Mapping(target = "personal", ignore = true)
    AsistenciaPersonal toEntity(AsistenciaPersonalDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "personal", ignore = true)
    void updateEntityFromDto(AsistenciaPersonalDTO dto, @MappingTarget AsistenciaPersonal entity);
}
