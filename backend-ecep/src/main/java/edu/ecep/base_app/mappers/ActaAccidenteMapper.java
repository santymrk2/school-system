package edu.ecep.base_app.mappers;

import edu.ecep.base_app.domain.ActaAccidente;
import edu.ecep.base_app.dtos.ActaAccidenteDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

/* ========== ACTA ACCIDENTE ========== */
@Mapper(componentModel = "spring")
public interface ActaAccidenteMapper {
    @Mapping(source = "matricula.id", target = "matriculaId")
    ActaAccidenteDTO toDto(ActaAccidente entity);

    @Mapping(target = "matricula", ignore = true)
    ActaAccidente toEntity(ActaAccidenteDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "matricula", ignore = true)
    void updateEntityFromDto(ActaAccidenteDTO dto, @MappingTarget ActaAccidente entity);
}
