package edu.ecep.base_app.gestionacademica.infrastructure.mapper;

import edu.ecep.base_app.gestionacademica.domain.Evaluacion;
import edu.ecep.base_app.gestionacademica.presentation.dto.EvaluacionCreateDTO;
import edu.ecep.base_app.gestionacademica.presentation.dto.EvaluacionDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;
import edu.ecep.base_app.shared.mapper.RefMapper;

@Mapper(componentModel = "spring", uses = RefMapper.class, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface EvaluacionMapper {
    @Mapping(target="seccionMateriaId", source="seccionMateria.id")
    @Mapping(target="trimestreId",      source="trimestre.id")
    EvaluacionDTO toDto(Evaluacion e);

    @Mapping(target="seccionMateria", source="seccionMateriaId")
    @Mapping(target="trimestre",      source="trimestreId")
    Evaluacion toEntity(EvaluacionCreateDTO dto);

    @Mapping(target="seccionMateria", source="seccionMateriaId")
    @Mapping(target="trimestre",      source="trimestreId")
    void update(@MappingTarget Evaluacion entity, EvaluacionDTO dto);
}
