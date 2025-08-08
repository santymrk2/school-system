package edu.ecep.base_app.mappers;

import edu.ecep.base_app.domain.DiaNoHabil;
import edu.ecep.base_app.dtos.DiaNoHabilDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

/* ========== DÍA NO HÁBIL ========== */
@Mapper(componentModel = "spring")
public interface DiaNoHabilMapper {
    DiaNoHabilDTO toDto(DiaNoHabil entity);

    DiaNoHabil toEntity(DiaNoHabilDTO dto);

    @Mapping(target = "id", ignore = true)
    void updateEntityFromDto(DiaNoHabilDTO dto, @MappingTarget DiaNoHabil entity);
}
