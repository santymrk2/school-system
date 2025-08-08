package edu.ecep.base_app.mappers;

import edu.ecep.base_app.domain.AlumnoFamiliar;
import edu.ecep.base_app.dtos.AlumnoFamiliarDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

/* ========== ALUMNO FAMILIAR ========== */
@Mapper(componentModel = "spring")
public interface AlumnoFamiliarMapper {
    @Mapping(source = "alumno.id", target = "alumnoId")
    @Mapping(source = "familiar.id", target = "familiarId")
    AlumnoFamiliarDTO toDto(AlumnoFamiliar entity);

    @Mapping(target = "alumno", ignore = true)
    @Mapping(target = "familiar", ignore = true)
    AlumnoFamiliar toEntity(AlumnoFamiliarDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "alumno", ignore = true)
    @Mapping(target = "familiar", ignore = true)
    void updateEntityFromDto(AlumnoFamiliarDTO dto, @MappingTarget AlumnoFamiliar entity);
}
