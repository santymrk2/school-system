package edu.ecep.base_app.finanzas.infrastructure.mapper;

import edu.ecep.base_app.finanzas.domain.PagoCuota;
import edu.ecep.base_app.finanzas.presentation.dto.PagoCuotaCreateDTO;
import edu.ecep.base_app.finanzas.presentation.dto.PagoCuotaDTO;
import edu.ecep.base_app.finanzas.presentation.dto.PagoCuotaEstadoUpdateDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import edu.ecep.base_app.shared.mapper.ModelMapperConfig;
import edu.ecep.base_app.shared.mapper.RefMapper;

@Mapper(config = ModelMapperConfig.class, uses = RefMapper.class)
public interface PagoCuotaMapper {
    @Mapping(target = "cuotaId", source = "cuota.id")
    PagoCuotaDTO toDto(PagoCuota e);

    @Mapping(target = "cuota", source = "cuotaId")
    PagoCuota toEntity(PagoCuotaCreateDTO dto);

    default void updateEstado(@MappingTarget PagoCuota e, PagoCuotaEstadoUpdateDTO dto) {
        e.setEstadoPago(dto.getEstadoPago());
        e.setFechaAcreditacion(dto.getFechaAcreditacion());
    }
}
