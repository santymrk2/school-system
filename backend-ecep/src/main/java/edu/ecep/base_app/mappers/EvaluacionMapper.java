package edu.ecep.base_app.mappers;

import edu.ecep.base_app.domain.Evaluacion;
import edu.ecep.base_app.dtos.EvaluacionDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

/* ========== EVALUACIÓN ========== */
@Mapper(componentModel = "spring")
public interface EvaluacionMapper {
    @Mapping(source = "seccion.id", target = "seccionId")
    @Mapping(source = "materia.id", target = "materiaId")
    EvaluacionDTO toDto(Evaluacion entity);

    @Mapping(target = "seccion", ignore = true)
    @Mapping(target = "materia", ignore = true)
    Evaluacion toEntity(EvaluacionDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "seccion", ignore = true)
    @Mapping(target = "materia", ignore = true)
    void updateEntityFromDto(EvaluacionDTO dto, @MappingTarget Evaluacion entity);
}
