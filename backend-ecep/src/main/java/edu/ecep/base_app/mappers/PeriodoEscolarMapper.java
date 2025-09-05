package edu.ecep.base_app.mappers;

import edu.ecep.base_app.domain.PeriodoEscolar;
import edu.ecep.base_app.dtos.PeriodoEscolarCreateDTO;
import edu.ecep.base_app.dtos.PeriodoEscolarDTO;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(config = ModelMapperConfig.class)
public interface PeriodoEscolarMapper {
    PeriodoEscolarDTO toDto(PeriodoEscolar e);

    PeriodoEscolar toEntity(PeriodoEscolarCreateDTO dto);

    void update(@MappingTarget PeriodoEscolar e, PeriodoEscolarDTO dto);
}
