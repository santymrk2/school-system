package edu.ecep.base_app.finanzas.infrastructure.mapper;

import edu.ecep.base_app.finanzas.domain.Cuota;
import edu.ecep.base_app.finanzas.presentation.dto.CuotaCreateDTO;
import edu.ecep.base_app.finanzas.presentation.dto.CuotaDTO;
import edu.ecep.base_app.shared.mapper.ModelMapperConfig;
import edu.ecep.base_app.shared.mapper.RefMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(config = ModelMapperConfig.class, uses = RefMapper.class)
public interface CuotaMapper {
    @Mapping(target = "matriculaId", source = "matricula.id")
    @Mapping(target = "emisionId", source = "emision.id")
    CuotaDTO toDto(Cuota e);

    @Mapping(target = "matricula", source = "matriculaId")
    @Mapping(target = "emision", source = "emisionId")
    Cuota toEntity(CuotaCreateDTO dto);

    @Mapping(target = "matricula", source = "matriculaId")
    @Mapping(target = "emision", source = "emisionId")
    void update(@MappingTarget Cuota e, CuotaDTO dto);
}
