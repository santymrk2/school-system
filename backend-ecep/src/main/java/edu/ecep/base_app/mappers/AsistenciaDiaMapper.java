package edu.ecep.base_app.mappers;

import edu.ecep.base_app.domain.AsistenciaDia;
import edu.ecep.base_app.dtos.AsistenciaDiaDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

/* ========== ASISTENCIA DÍA ========== */
@Mapper(componentModel = "spring")
public interface AsistenciaDiaMapper {
    @Mapping(source = "seccion.id", target = "seccionId")
    AsistenciaDiaDTO toDto(AsistenciaDia entity);

    @Mapping(target = "seccion", ignore = true)
    AsistenciaDia toEntity(AsistenciaDiaDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "seccion", ignore = true)
    void updateEntityFromDto(AsistenciaDiaDTO dto, @MappingTarget AsistenciaDia entity);
}
