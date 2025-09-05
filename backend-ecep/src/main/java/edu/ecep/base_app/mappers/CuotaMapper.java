package edu.ecep.base_app.mappers;

import edu.ecep.base_app.domain.Cuota;
import edu.ecep.base_app.dtos.CuotaCreateDTO;
import edu.ecep.base_app.dtos.CuotaDTO;
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
