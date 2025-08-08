package edu.ecep.base_app.mappers;

import edu.ecep.base_app.domain.PagoCuota;
import edu.ecep.base_app.dtos.PagoCuotaDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

/* ========== PAGO CUOTA ========== */
@Mapper(componentModel = "spring")
public interface PagoCuotaMapper {
    @Mapping(source = "cuota.id", target = "cuotaId")
    @Mapping(source = "matricula.id", target = "matriculaId")
    PagoCuotaDTO toDto(PagoCuota entity);

    @Mapping(target = "cuota", ignore = true)
    @Mapping(target = "matricula", ignore = true)
    PagoCuota toEntity(PagoCuotaDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "cuota", ignore = true)
    @Mapping(target = "matricula", ignore = true)
    void updateEntityFromDto(PagoCuotaDTO dto, @MappingTarget PagoCuota entity);
}
