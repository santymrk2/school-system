package edu.ecep.base_app.gestionacademica.infrastructure.mapper;

import edu.ecep.base_app.gestionacademica.domain.Seccion;
import edu.ecep.base_app.gestionacademica.presentation.dto.SeccionCreateDTO;
import edu.ecep.base_app.gestionacademica.presentation.dto.SeccionDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import edu.ecep.base_app.shared.mapper.ModelMapperConfig;
import edu.ecep.base_app.shared.mapper.RefMapper;

@Mapper(config = ModelMapperConfig.class, uses = RefMapper.class)
public interface SeccionMapper {
    @Mapping(target = "periodoEscolarId", source = "periodoEscolar.id")
    SeccionDTO toDto(Seccion e);

    @Mapping(target = "periodoEscolar", source = "periodoEscolarId")
    Seccion toEntity(SeccionCreateDTO dto);

    @Mapping(target = "periodoEscolar", source = "periodoEscolarId")
    void update(@MappingTarget Seccion e, SeccionDTO dto);
}
