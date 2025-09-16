package edu.ecep.base_app.mappers;

import edu.ecep.base_app.domain.AsistenciaEmpleados;
import edu.ecep.base_app.dtos.*;
import org.mapstruct.*;

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

