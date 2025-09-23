package edu.ecep.base_app.gestionacademica.infrastructure.mapper;

import edu.ecep.base_app.gestionacademica.domain.ResultadoEvaluacion;
import edu.ecep.base_app.gestionacademica.presentation.dto.ResultadoEvaluacionCreateDTO;
import edu.ecep.base_app.gestionacademica.presentation.dto.ResultadoEvaluacionDTO;
import edu.ecep.base_app.gestionacademica.presentation.dto.ResultadoEvaluacionUpdateDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;
import edu.ecep.base_app.shared.mapper.RefMapper;

@Mapper(componentModel = "spring", uses = RefMapper.class, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ResultadoEvaluacionMapper {
    @Mapping(target="evaluacionId", source="evaluacion.id")
    @Mapping(target="matriculaId",  source="matricula.id")
    ResultadoEvaluacionDTO toDto(ResultadoEvaluacion e);

    @Mapping(target="evaluacion", source="evaluacionId")
    @Mapping(target="matricula",  source="matriculaId")
    ResultadoEvaluacion toEntity(ResultadoEvaluacionCreateDTO dto);

    void update(@MappingTarget ResultadoEvaluacion entity, ResultadoEvaluacionUpdateDTO dto);
}
