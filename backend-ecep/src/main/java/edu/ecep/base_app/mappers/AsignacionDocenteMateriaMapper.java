package edu.ecep.base_app.mappers;

import edu.ecep.base_app.domain.AsignacionDocenteMateria;
import edu.ecep.base_app.dtos.AsignacionDocenteMateriaCreateDTO;
import edu.ecep.base_app.dtos.AsignacionDocenteMateriaDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(config = ModelMapperConfig.class, uses = RefMapper.class)
public interface AsignacionDocenteMateriaMapper {
    @Mapping(target = "seccionMateriaId", source = "seccionMateria.id")
    @Mapping(target = "empleadoId", source = "empleado.id")
    AsignacionDocenteMateriaDTO toDto(AsignacionDocenteMateria e);

    @Mapping(target = "seccionMateria", source = "seccionMateriaId")
    @Mapping(target = "empleado", source = "empleadoId")
    AsignacionDocenteMateria toEntity(AsignacionDocenteMateriaCreateDTO dto);

    @Mapping(target = "seccionMateria", source = "seccionMateriaId")
    @Mapping(target = "empleado", source = "empleadoId")
    void update(@MappingTarget AsignacionDocenteMateria e, AsignacionDocenteMateriaDTO dto);
}
