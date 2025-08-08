package edu.ecep.base_app.mappers;

import edu.ecep.base_app.domain.FormacionAcademica;
import edu.ecep.base_app.dtos.FormacionAcademicaDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

/* ========== FORMACION ACADEMICA ========== */
@Mapper(componentModel = "spring")
public interface FormacionAcademicaMapper {
    FormacionAcademicaDTO toDto(FormacionAcademica entity);

    FormacionAcademica toEntity(FormacionAcademicaDTO dto);

    @Mapping(target = "id", ignore = true)
    void updateEntityFromDto(FormacionAcademicaDTO dto, @MappingTarget FormacionAcademica entity);
}
