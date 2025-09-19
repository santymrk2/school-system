package edu.ecep.base_app.mappers;

import edu.ecep.base_app.domain.SolicitudBajaAlumno;
import edu.ecep.base_app.dtos.SolicitudBajaAlumnoCreateDTO;
import edu.ecep.base_app.dtos.SolicitudBajaAlumnoDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(config = ModelMapperConfig.class, uses = RefMapper.class)
public interface SolicitudBajaAlumnoMapper {
    @Mapping(target = "matriculaId", source = "matricula.id")
    @Mapping(target = "decididoPor", source = "decididoPorPersonaId")
    SolicitudBajaAlumnoDTO toDto(SolicitudBajaAlumno e);

    @Mapping(target = "matricula", source = "matriculaId")
    SolicitudBajaAlumno toEntity(SolicitudBajaAlumnoCreateDTO dto);
}
