package edu.ecep.base_app.comunicacion.infrastructure.mapper;

import edu.ecep.base_app.comunicacion.domain.Comunicado;
import edu.ecep.base_app.comunicacion.presentation.dto.ComunicadoCreateDTO;
import edu.ecep.base_app.comunicacion.presentation.dto.ComunicadoDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import edu.ecep.base_app.shared.mapper.ModelMapperConfig;
import edu.ecep.base_app.shared.mapper.RefMapper;

@Mapper(config = ModelMapperConfig.class, uses = RefMapper.class)
public interface ComunicadoMapper {
    @Mapping(target = "seccionId", source = "seccion.id")
    @Mapping(target = "fechaCreacion", source = "dateCreated")
    ComunicadoDTO toDto(Comunicado e);

    @Mapping(target = "seccion", source = "seccionId")
    Comunicado toEntity(ComunicadoCreateDTO dto);

    @Mapping(target = "seccion", source = "seccionId")
    void update(@MappingTarget Comunicado e, ComunicadoDTO dto);
}
