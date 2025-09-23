package edu.ecep.base_app.finanzas.infrastructure.mapper;

import edu.ecep.base_app.finanzas.domain.EmisionCuota;
import edu.ecep.base_app.finanzas.presentation.dto.EmisionCuotaCreateDTO;
import edu.ecep.base_app.finanzas.presentation.dto.EmisionCuotaDTO;
import org.mapstruct.Mapper;
import edu.ecep.base_app.shared.mapper.ModelMapperConfig;
import edu.ecep.base_app.shared.mapper.DateMapper;

@Mapper(config = ModelMapperConfig.class, uses = { DateMapper.class })
public interface EmisionCuotaMapper {
    EmisionCuotaDTO toDto(EmisionCuota e);

    EmisionCuota toEntity(EmisionCuotaCreateDTO dto);
}
