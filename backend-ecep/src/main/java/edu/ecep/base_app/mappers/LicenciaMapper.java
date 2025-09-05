package edu.ecep.base_app.mappers;

import edu.ecep.base_app.domain.Licencia;
import edu.ecep.base_app.dtos.LicenciaCreateDTO;
import edu.ecep.base_app.dtos.LicenciaDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", uses = RefMapper.class, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface LicenciaMapper {

    @Mapping(target = "personalId", source = "personal.id")
    LicenciaDTO toDto(Licencia e);

    @Mapping(target = "personal", source = "personalId")
    Licencia toEntity(LicenciaCreateDTO dto);

    @Mapping(target = "personal", source = "personalId")
    @Mapping(target = "id", ignore = true)
    void update(@MappingTarget Licencia e, LicenciaDTO dto);
}
