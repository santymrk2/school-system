package edu.ecep.base_app.identidad.infrastructure.mapper;

import org.mapstruct.*;
import edu.ecep.base_app.identidad.domain.Persona;
import edu.ecep.base_app.identidad.presentation.dto.PersonaDTO;
import edu.ecep.base_app.identidad.presentation.dto.PersonaCreateDTO;
import edu.ecep.base_app.identidad.presentation.dto.PersonaUpdateDTO;
import edu.ecep.base_app.shared.mapper.ModelMapperConfig;
import edu.ecep.base_app.shared.mapper.RefMapper;

/**
 * Mapper de Persona ↔ DTOs.
 * - toDto: Entity → DTO
 * - toEntity: CreateDTO → Entity
 * - update: aplica sólo campos no nulos del UpdateDTO sobre la entidad existente
 */
@Mapper(config = ModelMapperConfig.class, uses = RefMapper.class)
public interface PersonaMapper {

    // Entity → DTO
    @Mapping(target = "credencialesActivas", expression = "java(e.getPassword() != null)")
    PersonaDTO toDto(Persona e);

    // CreateDTO → Entity
    Persona toEntity(PersonaCreateDTO dto);

    // Update parcial: ignora nulls del DTO
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void update(@MappingTarget Persona target, PersonaUpdateDTO dto);
}
