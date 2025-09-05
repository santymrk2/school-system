package edu.ecep.base_app.mappers;

import edu.ecep.base_app.domain.InformeInicial;
import edu.ecep.base_app.dtos.InformeInicialCreateDTO;
import edu.ecep.base_app.dtos.InformeInicialDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

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
