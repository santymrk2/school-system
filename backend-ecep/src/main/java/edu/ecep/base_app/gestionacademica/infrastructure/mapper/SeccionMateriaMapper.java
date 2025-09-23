package edu.ecep.base_app.gestionacademica.infrastructure.mapper;

import edu.ecep.base_app.gestionacademica.domain.SeccionMateria;
import edu.ecep.base_app.gestionacademica.presentation.dto.SeccionMateriaCreateDTO;
import edu.ecep.base_app.gestionacademica.presentation.dto.SeccionMateriaDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import edu.ecep.base_app.shared.mapper.ModelMapperConfig;
import edu.ecep.base_app.shared.mapper.RefMapper;

@Mapper(config = ModelMapperConfig.class, uses = RefMapper.class)
public interface SeccionMateriaMapper {
    @Mapping(target = "seccionId", source = "seccion.id")
    @Mapping(target = "materiaId", source = "materia.id")
    SeccionMateriaDTO toDto(SeccionMateria e);

    @Mapping(target = "seccion", source = "seccionId")
    @Mapping(target = "materia", source = "materiaId")
    SeccionMateria toEntity(SeccionMateriaCreateDTO dto);
}
