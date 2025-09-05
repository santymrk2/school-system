package edu.ecep.base_app.mappers;

import edu.ecep.base_app.dtos.*;
import edu.ecep.base_app.domain.AsistenciaPersonal;
import org.mapstruct.*;

@Mapper(componentModel = "spring", uses = RefMapper.class, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface AsistenciaPersonalMapper {

    @Mapping(target = "personalId", source = "personal.id")
    AsistenciaPersonalDTO toDto(AsistenciaPersonal entity);

    @Mapping(target = "personal", source = "personalId")
    AsistenciaPersonal toEntity(AsistenciaPersonalDTO dto);

    // Si usás el CreateDTO, dejá también este método:
    @Mapping(target = "personal", source = "personalId")
    AsistenciaPersonal toEntity(AsistenciaPersonalCreateDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "personal", source = "personalId")
    void updateEntityFromDto(AsistenciaPersonalDTO dto, @MappingTarget AsistenciaPersonal entity);
}

