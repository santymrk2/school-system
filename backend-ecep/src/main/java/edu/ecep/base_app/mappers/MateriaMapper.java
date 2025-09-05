package edu.ecep.base_app.mappers;

import edu.ecep.base_app.domain.Materia;
import edu.ecep.base_app.dtos.MateriaCreateDTO;
import edu.ecep.base_app.dtos.MateriaDTO;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(config = ModelMapperConfig.class)
public interface MateriaMapper {
    MateriaDTO toDto(Materia e);
    Materia toEntity(MateriaCreateDTO dto);
    void update(@MappingTarget Materia e, MateriaDTO dto);
}
