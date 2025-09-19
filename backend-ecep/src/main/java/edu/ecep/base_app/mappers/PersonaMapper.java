package edu.ecep.base_app.mappers;

import org.mapstruct.*;
import edu.ecep.base_app.domain.Persona;
import edu.ecep.base_app.dtos.PersonaDTO;
import edu.ecep.base_app.dtos.PersonaCreateDTO;
import edu.ecep.base_app.dtos.PersonaUpdateDTO;

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
