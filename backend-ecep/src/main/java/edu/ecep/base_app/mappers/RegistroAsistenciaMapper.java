package edu.ecep.base_app.mappers;

import edu.ecep.base_app.domain.RegistroAsistencia;
import edu.ecep.base_app.dtos.RegistroAsistenciaDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

/* ========== REGISTRO ASISTENCIA ========== */
@Mapper(componentModel = "spring")
public interface RegistroAsistenciaMapper {
    @Mapping(source = "asistenciaDia.id", target = "asistenciaDiaId")
    @Mapping(source = "matricula.id", target = "matriculaId")
    RegistroAsistenciaDTO toDto(RegistroAsistencia entity);

    @Mapping(target = "asistenciaDia", ignore = true)
    @Mapping(target = "matricula", ignore = true)
    RegistroAsistencia toEntity(RegistroAsistenciaDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "asistenciaDia", ignore = true)
    @Mapping(target = "matricula", ignore = true)
    void updateEntityFromDto(RegistroAsistenciaDTO dto, @MappingTarget RegistroAsistencia entity);
}
