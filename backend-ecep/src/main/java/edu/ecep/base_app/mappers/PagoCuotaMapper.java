package edu.ecep.base_app.mappers;

import edu.ecep.base_app.domain.PagoCuota;
import edu.ecep.base_app.dtos.PagoCuotaCreateDTO;
import edu.ecep.base_app.dtos.PagoCuotaDTO;
import edu.ecep.base_app.dtos.PagoCuotaEstadoUpdateDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

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
