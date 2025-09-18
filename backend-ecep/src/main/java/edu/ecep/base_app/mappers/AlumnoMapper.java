package edu.ecep.base_app.mappers;

import edu.ecep.base_app.domain.Alumno;
import edu.ecep.base_app.dtos.AlumnoDTO;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import org.mapstruct.*;


@Mapper(config = ModelMapperConfig.class, uses = RefMapper.class)
public interface AlumnoMapper {

    // Entity -> DTO
    @Mapping(target = "personaId", source = "persona.id")
    @Mapping(target = "nombre", source = "persona.nombre")
    @Mapping(target = "apellido", source = "persona.apellido")
    @Mapping(target = "dni", source = "persona.dni")
    @Mapping(target = "seccionActualId", ignore = true)
    @Mapping(target = "seccionActualNombre", ignore = true)
    AlumnoDTO toDto(Alumno e);

    // DTO -> Entity
    @Mapping(target = "persona", source = "personaId")
    Alumno toEntity(AlumnoDTO dto);

    // Update (no tocar id; re-resolver persona desde personaId)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "persona", source = "personaId")
    void update(@MappingTarget Alumno e, AlumnoDTO dto);
}
