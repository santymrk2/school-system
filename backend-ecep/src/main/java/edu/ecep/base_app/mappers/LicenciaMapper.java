package edu.ecep.base_app.mappers;

import edu.ecep.base_app.domain.Licencia;
import edu.ecep.base_app.dtos.LicenciaDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

/* ========== LICENCIA ========== */
@Mapper(componentModel = "spring")
public interface LicenciaMapper {
    @Mapping(source = "personal.id", target = "personalId")
    LicenciaDTO toDto(Licencia entity);

    @Mapping(target = "personal", ignore = true)
    Licencia toEntity(LicenciaDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "personal", ignore = true)
    void updateEntityFromDto(LicenciaDTO dto, @MappingTarget Licencia entity);
}
