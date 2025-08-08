package edu.ecep.base_app.mappers;

import edu.ecep.base_app.domain.Materia;
import edu.ecep.base_app.dtos.MateriaDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

/* ========== MATERIA ========== */
@Mapper(componentModel = "spring")
public interface MateriaMapper {
    MateriaDTO toDto(Materia entity);

    Materia toEntity(MateriaDTO dto);

    @Mapping(target = "id", ignore = true)
    void updateEntityFromDto(MateriaDTO dto, @MappingTarget Materia entity);
}
