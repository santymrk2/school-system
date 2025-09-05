package edu.ecep.base_app.mappers;

import edu.ecep.base_app.domain.Comunicado;
import edu.ecep.base_app.dtos.ComunicadoCreateDTO;
import edu.ecep.base_app.dtos.ComunicadoDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(config = ModelMapperConfig.class, uses = RefMapper.class)
public interface ComunicadoMapper {
    @Mapping(target = "seccionId", source = "seccion.id")
    ComunicadoDTO toDto(Comunicado e);

    @Mapping(target = "seccion", source = "seccionId")
    Comunicado toEntity(ComunicadoCreateDTO dto);

    @Mapping(target = "seccion", source = "seccionId")
    void update(@MappingTarget Comunicado e, ComunicadoDTO dto);
}
