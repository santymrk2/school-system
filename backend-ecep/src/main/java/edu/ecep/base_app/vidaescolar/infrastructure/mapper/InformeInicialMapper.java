package edu.ecep.base_app.vidaescolar.infrastructure.mapper;

import edu.ecep.base_app.vidaescolar.domain.InformeInicial;
import edu.ecep.base_app.vidaescolar.presentation.dto.InformeInicialCreateDTO;
import edu.ecep.base_app.vidaescolar.presentation.dto.InformeInicialDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import edu.ecep.base_app.shared.mapper.ModelMapperConfig;
import edu.ecep.base_app.shared.mapper.RefMapper;

@Mapper(config = ModelMapperConfig.class, uses = RefMapper.class)
public interface InformeInicialMapper {
    @Mapping(target = "trimestreId", source = "trimestre.id")
    @Mapping(target = "matriculaId", source = "matricula.id")
    InformeInicialDTO toDto(InformeInicial e);

    @Mapping(target = "trimestre", source = "trimestreId")
    @Mapping(target = "matricula", source = "matriculaId")
    InformeInicial toEntity(InformeInicialCreateDTO dto);

    @Mapping(target = "trimestre", source = "trimestreId")
    @Mapping(target = "matricula", source = "matriculaId")
    void update(@MappingTarget InformeInicial e, InformeInicialDTO dto);
}
