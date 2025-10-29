package edu.ecep.base_app.comunicacion.infrastructure.mapper;

import edu.ecep.base_app.comunicacion.domain.Comunicado;
import edu.ecep.base_app.comunicacion.presentation.dto.ComunicadoCreateDTO;
import edu.ecep.base_app.comunicacion.presentation.dto.ComunicadoDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import edu.ecep.base_app.shared.mapper.ModelMapperConfig;

@Mapper(config = ModelMapperConfig.class)
public interface ComunicadoMapper {
    @Mapping(target = "fechaCreacion", source = "dateCreated")
    ComunicadoDTO toDto(Comunicado e);

    Comunicado toEntity(ComunicadoCreateDTO dto);

    @Mapping(target = "id", ignore = true)
    void update(@MappingTarget Comunicado e, ComunicadoDTO dto);
}
