package edu.ecep.base_app.gestionacademica.infrastructure.mapper;

import edu.ecep.base_app.gestionacademica.domain.Materia;
import edu.ecep.base_app.gestionacademica.presentation.dto.MateriaCreateDTO;
import edu.ecep.base_app.gestionacademica.presentation.dto.MateriaDTO;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import edu.ecep.base_app.shared.mapper.ModelMapperConfig;

@Mapper(config = ModelMapperConfig.class)
public interface MateriaMapper {
    MateriaDTO toDto(Materia e);
    Materia toEntity(MateriaCreateDTO dto);
    void update(@MappingTarget Materia e, MateriaDTO dto);
}
