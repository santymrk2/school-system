package edu.ecep.base_app.asistencias.infrastructure.mapper;

import edu.ecep.base_app.asistencias.domain.JornadaAsistencia;
import edu.ecep.base_app.asistencias.presentation.dto.JornadaAsistenciaCreateDTO;
import edu.ecep.base_app.asistencias.presentation.dto.JornadaAsistenciaDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;
import edu.ecep.base_app.shared.mapper.RefMapper;

@Mapper(componentModel = "spring", uses = RefMapper.class, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface JornadaAsistenciaMapper {
    @Mapping(target="seccionId",   source="seccion.id")
    @Mapping(target="trimestreId", source="trimestre.id")
    JornadaAsistenciaDTO toDto(JornadaAsistencia e);

    @Mapping(target="seccion",   source="seccionId")
    @Mapping(target="trimestre", source="trimestreId")
    JornadaAsistencia toEntity(JornadaAsistenciaCreateDTO dto);
}
