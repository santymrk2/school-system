package edu.ecep.base_app.mappers;

import edu.ecep.base_app.domain.ResultadoEvaluacion;
import edu.ecep.base_app.dtos.ResultadoEvaluacionCreateDTO;
import edu.ecep.base_app.dtos.ResultadoEvaluacionDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", uses = RefMapper.class, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ResultadoEvaluacionMapper {
    @Mapping(target="evaluacionId", source="evaluacion.id")
    @Mapping(target="matriculaId",  source="matricula.id")
    ResultadoEvaluacionDTO toDto(ResultadoEvaluacion e);

    @Mapping(target="evaluacion", source="evaluacionId")
    @Mapping(target="matricula",  source="matriculaId")
    ResultadoEvaluacion toEntity(ResultadoEvaluacionCreateDTO dto);
}
