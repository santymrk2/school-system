package edu.ecep.base_app.mappers;

import edu.ecep.base_app.domain.Seccion;
import edu.ecep.base_app.dtos.SeccionDTO;
import edu.ecep.base_app.domain.Cuota;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import java.util.Set;
import java.util.stream.Collectors;

/* ========== SECCIÓN ========== */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface SeccionMapper {

    @Mapping(source = "cuotas", target = "cuotasIds")
    SeccionDTO toDto(Seccion entity);

    @Mapping(target = "cuotas", ignore = true)
    Seccion toEntity(SeccionDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "cuotas", ignore = true)
    void updateEntityFromDto(SeccionDTO dto, @MappingTarget Seccion entity);

    // === Conversión automática Set<Cuota> -> Set<Long> ===
    default Long mapCuotaToId(Cuota cuota) {
        return cuota != null ? cuota.getId() : null;
    }

    default Set<Long> map(Set<Cuota> cuotas) {
        return cuotas != null
                ? cuotas.stream().map(this::mapCuotaToId).collect(Collectors.toSet())
                : null;
    }
}