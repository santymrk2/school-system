package edu.ecep.base_app.mappers;

import edu.ecep.base_app.domain.EmisionCuota;
import edu.ecep.base_app.dtos.EmisionCuotaCreateDTO;
import edu.ecep.base_app.dtos.EmisionCuotaDTO;
import org.mapstruct.Mapper;

@Mapper(config = ModelMapperConfig.class, uses = { DateMapper.class })
public interface EmisionCuotaMapper {
    EmisionCuotaDTO toDto(EmisionCuota e);

    EmisionCuota toEntity(EmisionCuotaCreateDTO dto);
}
