package edu.ecep.base_app.mappers;

import edu.ecep.base_app.domain.JornadaAsistencia;
import edu.ecep.base_app.dtos.JornadaAsistenciaCreateDTO;
import edu.ecep.base_app.dtos.JornadaAsistenciaDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", uses = RefMapper.class, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface JornadaAsistenciaMapper {
    @Mapping(target="seccionId",   source="seccion.id")
    @Mapping(target="trimestreId", source="trimestre.id")
    JornadaAsistenciaDTO toDto(JornadaAsistencia e);

    @Mapping(target="seccion",   source="seccionId")
    @Mapping(target="trimestre", source="trimestreId")
    JornadaAsistencia toEntity(JornadaAsistenciaCreateDTO dto);
}
