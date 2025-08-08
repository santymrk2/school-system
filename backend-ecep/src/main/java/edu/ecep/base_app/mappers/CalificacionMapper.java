package edu.ecep.base_app.mappers;

import edu.ecep.base_app.domain.Calificacion;
import edu.ecep.base_app.dtos.CalificacionDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

/* ========== CALIFICACIÓN ========== */
@Mapper(componentModel = "spring")
public interface CalificacionMapper {
    @Mapping(source = "matricula.id", target = "matriculaId")
    CalificacionDTO toDto(Calificacion entity);

    @Mapping(target = "matricula", ignore = true)
    Calificacion toEntity(CalificacionDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "matricula", ignore = true)
    void updateEntityFromDto(CalificacionDTO dto, @MappingTarget Calificacion entity);
}
