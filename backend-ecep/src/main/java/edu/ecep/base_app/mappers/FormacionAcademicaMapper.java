package edu.ecep.base_app.mappers;

import edu.ecep.base_app.domain.FormacionAcademica;
import edu.ecep.base_app.dtos.FormacionAcademicaDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface FormacionAcademicaMapper {
    @Mapping(source = "empleado.id", target = "empleadoId")
    FormacionAcademicaDTO toDto(FormacionAcademica entity);

    @Mapping(target = "empleado", ignore = true) // lo setea el service por id
    FormacionAcademica toEntity(FormacionAcademicaDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "empleado", ignore = true)
    void updateEntityFromDto(FormacionAcademicaDTO dto, @MappingTarget FormacionAcademica entity);
}
