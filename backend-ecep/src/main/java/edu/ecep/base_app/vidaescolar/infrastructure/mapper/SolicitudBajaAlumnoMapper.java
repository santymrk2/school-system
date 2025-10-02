package edu.ecep.base_app.vidaescolar.infrastructure.mapper;

import edu.ecep.base_app.vidaescolar.domain.SolicitudBajaAlumno;
import edu.ecep.base_app.vidaescolar.presentation.dto.SolicitudBajaAlumnoCreateDTO;
import edu.ecep.base_app.vidaescolar.presentation.dto.SolicitudBajaAlumnoDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import edu.ecep.base_app.shared.mapper.ModelMapperConfig;
import edu.ecep.base_app.shared.mapper.RefMapper;

@Mapper(config = ModelMapperConfig.class, uses = RefMapper.class)
public interface SolicitudBajaAlumnoMapper {
    @Mapping(target = "matriculaId", source = "matricula.id")
    @Mapping(target = "alumnoId", source = "matricula.alumno.id")
    @Mapping(target = "alumnoNombre", source = "matricula.alumno.persona.nombre")
    @Mapping(target = "alumnoApellido", source = "matricula.alumno.persona.apellido")
    @Mapping(target = "alumnoDni", source = "matricula.alumno.persona.dni")
    @Mapping(target = "periodoEscolarId", source = "matricula.periodoEscolar.id")
    SolicitudBajaAlumnoDTO toDto(SolicitudBajaAlumno e);

    @Mapping(target = "matricula", source = "matriculaId")
    SolicitudBajaAlumno toEntity(SolicitudBajaAlumnoCreateDTO dto);
}
