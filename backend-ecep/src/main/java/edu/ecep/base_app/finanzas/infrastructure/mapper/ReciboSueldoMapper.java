package edu.ecep.base_app.finanzas.infrastructure.mapper;

import edu.ecep.base_app.finanzas.domain.ReciboSueldo;
import edu.ecep.base_app.finanzas.presentation.dto.ReciboSueldoCreateDTO;
import edu.ecep.base_app.finanzas.presentation.dto.ReciboSueldoDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import edu.ecep.base_app.shared.mapper.ModelMapperConfig;
import edu.ecep.base_app.shared.mapper.RefMapper;

@Mapper(config = ModelMapperConfig.class, uses = RefMapper.class)
public interface ReciboSueldoMapper {
    @Mapping(target = "empleadoId", source = "empleado.id")
    ReciboSueldoDTO toDto(ReciboSueldo e);

    @Mapping(target = "empleado", source = "empleadoId")
    ReciboSueldo toEntity(ReciboSueldoCreateDTO dto);
}
