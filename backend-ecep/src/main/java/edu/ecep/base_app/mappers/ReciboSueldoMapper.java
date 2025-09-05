package edu.ecep.base_app.mappers;

import edu.ecep.base_app.domain.ReciboSueldo;
import edu.ecep.base_app.dtos.ReciboSueldoCreateDTO;
import edu.ecep.base_app.dtos.ReciboSueldoDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(config = ModelMapperConfig.class, uses = RefMapper.class)
public interface ReciboSueldoMapper {
    @Mapping(target = "personalId", source = "personal.id")
    ReciboSueldoDTO toDto(ReciboSueldo e);

    @Mapping(target = "personal", source = "personalId")
    ReciboSueldo toEntity(ReciboSueldoCreateDTO dto);
}
