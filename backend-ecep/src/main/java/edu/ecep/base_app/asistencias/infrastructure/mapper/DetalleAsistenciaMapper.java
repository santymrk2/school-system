package edu.ecep.base_app.asistencias.infrastructure.mapper;

import edu.ecep.base_app.asistencias.domain.DetalleAsistencia;
import edu.ecep.base_app.asistencias.presentation.dto.DetalleAsistenciaCreateDTO;
import edu.ecep.base_app.asistencias.presentation.dto.DetalleAsistenciaDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import edu.ecep.base_app.asistencias.domain.JornadaAsistencia;
import edu.ecep.base_app.vidaescolar.domain.Matricula;
import org.mapstruct.*;


@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface DetalleAsistenciaMapper {

    // Entity -> DTO
    @Mappings({
            @Mapping(target = "jornadaId", source = "jornada.id"),
            @Mapping(target = "matriculaId", source = "matricula.id"),
            @Mapping(target = "observacion", source = "obs")
    })
    DetalleAsistenciaDTO toDto(DetalleAsistencia entity);

    // CreateDTO -> Entity (solo seteamos asociaciones por id)
    @Mappings({
            @Mapping(target = "id", ignore = true),
            @Mapping(target = "dateCreated", ignore = true),
            @Mapping(target = "lastUpdated", ignore = true),
            @Mapping(target = "createdBy", ignore = true),
            @Mapping(target = "modifiedBy", ignore = true),
            @Mapping(target = "activo", ignore = true),
            @Mapping(target = "fechaEliminacion", ignore = true),
            @Mapping(target = "jornada", expression = "java(jornadaFromId(dto.getJornadaId()))"),
            @Mapping(target = "matricula", expression = "java(matriculaFromId(dto.getMatriculaId()))"),
            @Mapping(target = "obs", source = "observacion")
    })
    DetalleAsistencia toEntity(DetalleAsistenciaCreateDTO dto);

    // Helpers para construir entidades “proxy” solo con id
    default JornadaAsistencia jornadaFromId(Long id) {
        if (id == null) return null;
        JornadaAsistencia j = new JornadaAsistencia();
        j.setId(id);
        return j;
    }

    default Matricula matriculaFromId(Long id) {
        if (id == null) return null;
        Matricula m = new Matricula();
        m.setId(id);
        return m;
    }
}
