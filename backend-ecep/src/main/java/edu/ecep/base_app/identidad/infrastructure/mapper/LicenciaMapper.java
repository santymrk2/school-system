package edu.ecep.base_app.identidad.infrastructure.mapper;

import edu.ecep.base_app.identidad.domain.Empleado;
import edu.ecep.base_app.identidad.domain.Licencia;
import edu.ecep.base_app.identidad.domain.Persona;
import edu.ecep.base_app.identidad.presentation.dto.EmpleadoResumenDTO;
import edu.ecep.base_app.identidad.presentation.dto.LicenciaCreateDTO;
import edu.ecep.base_app.identidad.presentation.dto.LicenciaDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;
import edu.ecep.base_app.shared.mapper.RefMapper;

@Mapper(componentModel = "spring", uses = RefMapper.class, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface LicenciaMapper {

    @Mapping(target = "empleadoId", source = "empleado.id")
    @Mapping(target = "empleado", source = "empleado")
    LicenciaDTO toDto(Licencia e);

    @Mapping(target = "empleado", source = "empleadoId")
    Licencia toEntity(LicenciaCreateDTO dto);

    @Mapping(target = "empleado", source = "empleadoId")
    @Mapping(target = "id", ignore = true)
    void update(@MappingTarget Licencia e, LicenciaDTO dto);

    default EmpleadoResumenDTO toEmpleadoResumen(Empleado empleado) {
        if (empleado == null) {
            return null;
        }
        Persona persona = empleado.getPersona();
        String nombre = persona != null ? persona.getNombre() : null;
        String apellido = persona != null ? persona.getApellido() : null;
        String nombreCompleto = buildNombreCompleto(nombre, apellido);
        return new EmpleadoResumenDTO(
                empleado.getId(),
                persona != null ? persona.getId() : null,
                nombre,
                apellido,
                nombreCompleto,
                empleado.getCargo(),
                empleado.getLegajo()
        );
    }

    private String buildNombreCompleto(String nombre, String apellido) {
        String nombreSafe = nombre != null ? nombre.trim() : "";
        String apellidoSafe = apellido != null ? apellido.trim() : "";
        String combined = (nombreSafe + " " + apellidoSafe).trim();
        return combined.isEmpty() ? null : combined;
    }
}
