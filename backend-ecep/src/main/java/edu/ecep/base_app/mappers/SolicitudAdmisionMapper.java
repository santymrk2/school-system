package edu.ecep.base_app.mappers;

import edu.ecep.base_app.domain.SolicitudAdmision;
import edu.ecep.base_app.dtos.SolicitudAdmisionDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import org.mapstruct.*;

@Mapper(
        componentModel = "spring",
        uses = {RefMapper.class, AspiranteMapper.class},
        unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface SolicitudAdmisionMapper {

    @Mapping(target = "aspiranteId", source = "aspirante.id")
    @Mapping(target = "aspirante", source = "aspirante")
    @Mapping(target = "fechasPropuestas", expression = "java(toFechaList(entity))")
    @Mapping(target = "fechaEntrevistaConfirmada", source = "fechaEntrevista")
    @Mapping(target = "adjuntosInformativos", expression = "java(splitAdjuntos(entity.getAdjuntosInformativos()))")
    SolicitudAdmisionDTO toDto(SolicitudAdmision entity);

    @Mapping(target = "aspirante", source = "aspiranteId")
    @Mapping(target = "fechaEntrevista", source = "fechaEntrevistaConfirmada")
    @Mapping(target = "propuestaFecha1", ignore = true)
    @Mapping(target = "propuestaFecha2", ignore = true)
    @Mapping(target = "propuestaFecha3", ignore = true)
    @Mapping(target = "adjuntosInformativos", ignore = true)
    SolicitudAdmision toEntity(SolicitudAdmisionDTO dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "aspirante", source = "aspiranteId")
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "fechaEntrevista", source = "fechaEntrevistaConfirmada")
    @Mapping(target = "propuestaFecha1", ignore = true)
    @Mapping(target = "propuestaFecha2", ignore = true)
    @Mapping(target = "propuestaFecha3", ignore = true)
    @Mapping(target = "adjuntosInformativos", ignore = true)
    void updateEntityFromDto(SolicitudAdmisionDTO dto, @MappingTarget SolicitudAdmision entity);

    // Helpers --------------------------------
    default java.util.List<java.time.LocalDate> toFechaList(SolicitudAdmision entity) {
        java.util.List<java.time.LocalDate> fechas = new java.util.ArrayList<>();
        if (entity.getPropuestaFecha1() != null) fechas.add(entity.getPropuestaFecha1());
        if (entity.getPropuestaFecha2() != null) fechas.add(entity.getPropuestaFecha2());
        if (entity.getPropuestaFecha3() != null) fechas.add(entity.getPropuestaFecha3());
        return fechas;
    }

    default java.util.List<String> splitAdjuntos(String raw) {
        if (raw == null || raw.isBlank()) return java.util.Collections.emptyList();
        return java.util.Arrays.stream(raw.split("\\|\\|"))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }

    default String joinAdjuntos(java.util.List<String> adjuntos) {
        if (adjuntos == null || adjuntos.isEmpty()) return null;
        return String.join("||", adjuntos);
    }

    @AfterMapping
    default void applyFechas(SolicitudAdmisionDTO dto, @MappingTarget SolicitudAdmision entity) {
        java.util.List<java.time.LocalDate> fechas = dto.getFechasPropuestas();
        if (fechas != null) {
            entity.setPropuestaFecha1(fechas.size() > 0 ? fechas.get(0) : null);
            entity.setPropuestaFecha2(fechas.size() > 1 ? fechas.get(1) : null);
            entity.setPropuestaFecha3(fechas.size() > 2 ? fechas.get(2) : null);
        }

        if (dto.getAdjuntosInformativos() != null) {
            entity.setAdjuntosInformativos(joinAdjuntos(dto.getAdjuntosInformativos()));
        }
    }
}
