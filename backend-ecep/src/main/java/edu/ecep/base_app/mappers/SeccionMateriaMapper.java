package edu.ecep.base_app.mappers;

import edu.ecep.base_app.domain.SeccionMateria;
import edu.ecep.base_app.dtos.SeccionMateriaCreateDTO;
import edu.ecep.base_app.dtos.SeccionMateriaDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(config = ModelMapperConfig.class, uses = RefMapper.class)
public interface SeccionMateriaMapper {
    @Mapping(target = "seccionId", source = "seccion.id")
    @Mapping(target = "materiaId", source = "materia.id")
    SeccionMateriaDTO toDto(SeccionMateria e);

    @Mapping(target = "seccion", source = "seccionId")
    @Mapping(target = "materia", source = "materiaId")
    SeccionMateria toEntity(SeccionMateriaCreateDTO dto);
}
