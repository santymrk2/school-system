package edu.ecep.base_app.mappers;

import edu.ecep.base_app.domain.CalificacionTrimestral;
import edu.ecep.base_app.dtos.CalificacionTrimestralCreateDTO;
import edu.ecep.base_app.dtos.CalificacionTrimestralDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(config = ModelMapperConfig.class, uses = RefMapper.class)
public interface CalificacionTrimestralMapper {
    @Mapping(target = "trimestreId", source = "trimestre.id")
    @Mapping(target = "seccionMateriaId", source = "seccionMateria.id")
    @Mapping(target = "matriculaId", source = "matricula.id")
    CalificacionTrimestralDTO toDto(CalificacionTrimestral e);

    @Mapping(target = "trimestre", source = "trimestreId")
    @Mapping(target = "seccionMateria", source = "seccionMateriaId")
    @Mapping(target = "matricula", source = "matriculaId")
    CalificacionTrimestral toEntity(CalificacionTrimestralCreateDTO dto);

    @Mapping(target = "trimestre", source = "trimestreId")
    @Mapping(target = "seccionMateria", source = "seccionMateriaId")
    @Mapping(target = "matricula", source = "matriculaId")
    void update(@MappingTarget CalificacionTrimestral entity, CalificacionTrimestralDTO dto);
}
