package edu.ecep.base_app.mappers;

import edu.ecep.base_app.domain.ActaAccidente;
import edu.ecep.base_app.dtos.ActaAccidenteCreateDTO;
import edu.ecep.base_app.dtos.ActaAccidenteDTO;
import edu.ecep.base_app.dtos.ActaAccidenteUpdateDTO;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(config = ModelMapperConfig.class, uses = RefMapper.class)
public interface ActaAccidenteMapper {
    @Mapping(target = "alumnoId", source = "alumno.id")
    @Mapping(target = "informanteId", source = "informante.id")
    ActaAccidenteDTO toDto(ActaAccidente e);

    @Mapping(target = "alumno", source = "alumnoId")
    @Mapping(target = "informante", source = "informanteId")
    ActaAccidente toEntity(ActaAccidenteCreateDTO dto);

    @Mapping(target = "alumno", source = "alumnoId")
    @Mapping(target = "informante", source = "informanteId")
    void update(@MappingTarget ActaAccidente e, ActaAccidenteDTO dto);

    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "fechaSuceso", source = "fechaSuceso")
    @Mapping(target = "descripcion", source = "descripcion")
    @Mapping(target = "estado", source = "estado")
    @Mapping(target = "creadoPor", source = "creadoPor")
    void applyUpdate(@MappingTarget ActaAccidente e, ActaAccidenteUpdateDTO dto);
}
