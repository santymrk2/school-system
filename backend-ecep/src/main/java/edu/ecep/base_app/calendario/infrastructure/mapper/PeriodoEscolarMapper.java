package edu.ecep.base_app.calendario.infrastructure.mapper;

import edu.ecep.base_app.calendario.domain.PeriodoEscolar;
import edu.ecep.base_app.calendario.presentation.dto.PeriodoEscolarCreateDTO;
import edu.ecep.base_app.calendario.presentation.dto.PeriodoEscolarDTO;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import edu.ecep.base_app.shared.mapper.ModelMapperConfig;

@Mapper(config = ModelMapperConfig.class)
public interface PeriodoEscolarMapper {
    PeriodoEscolarDTO toDto(PeriodoEscolar e);

    PeriodoEscolar toEntity(PeriodoEscolarCreateDTO dto);

    void update(@MappingTarget PeriodoEscolar e, PeriodoEscolarDTO dto);
}
