package edu.ecep.base_app.asistencias.infrastructure.mapper;

import edu.ecep.base_app.asistencias.domain.AsistenciaEmpleados;
import edu.ecep.base_app.asistencias.presentation.dto.*;
import org.mapstruct.*;
import edu.ecep.base_app.shared.mapper.RefMapper;

@Mapper(componentModel = "spring", uses = RefMapper.class, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface AsistenciaEmpleadoMapper {

    @Mapping(target = "empleadoId", source = "empleado.id")
    AsistenciaEmpleadoDTO toDto(AsistenciaEmpleados entity);

    @Mapping(target = "empleado", source = "empleadoId")
    AsistenciaEmpleados toEntity(AsistenciaEmpleadoDTO dto);

    // Si usás el CreateDTO, dejá también este método:
    @Mapping(target = "empleado", source = "empleadoId")
    AsistenciaEmpleados toEntity(AsistenciaEmpleadoCreateDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "empleado", source = "empleadoId")
    void updateEntityFromDto(AsistenciaEmpleadoDTO dto, @MappingTarget AsistenciaEmpleados entity);
}

