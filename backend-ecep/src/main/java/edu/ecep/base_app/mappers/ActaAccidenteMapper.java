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
    @Mapping(target = "firmanteId", source = "firmante.id")
    ActaAccidenteDTO toDto(ActaAccidente e);

    @Mapping(target = "alumno", source = "alumnoId")
    @Mapping(target = "informante", source = "informanteId")
    @Mapping(target = "firmante", source = "firmanteId")
    ActaAccidente toEntity(ActaAccidenteCreateDTO dto);

    @Mapping(target = "alumno", source = "alumnoId")
    @Mapping(target = "informante", source = "informanteId")
    @Mapping(target = "firmante", source = "firmanteId")
    void update(@MappingTarget ActaAccidente e, ActaAccidenteDTO dto);

    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "fechaSuceso", source = "fechaSuceso")
    @Mapping(target = "horaSuceso", source = "horaSuceso")
    @Mapping(target = "lugar", source = "lugar")
    @Mapping(target = "descripcion", source = "descripcion")
    @Mapping(target = "acciones", source = "acciones")
    @Mapping(target = "estado", source = "estado")
    @Mapping(target = "creadoPor", source = "creadoPor")
    @Mapping(target = "firmante", source = "firmanteId")
    void applyUpdate(@MappingTarget ActaAccidente e, ActaAccidenteUpdateDTO dto);
}
