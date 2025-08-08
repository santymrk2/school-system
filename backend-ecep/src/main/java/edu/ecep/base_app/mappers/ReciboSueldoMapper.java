package edu.ecep.base_app.mappers;

import edu.ecep.base_app.domain.ReciboSueldo;
import edu.ecep.base_app.dtos.ReciboSueldoDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

/* ========== RECIBO SUELDO ========== */
@Mapper(componentModel = "spring")
public interface ReciboSueldoMapper {
    @Mapping(source = "personal.id", target = "personalId")
    ReciboSueldoDTO toDto(ReciboSueldo entity);

    @Mapping(target = "personal", ignore = true)
    ReciboSueldo toEntity(ReciboSueldoDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "personal", ignore = true)
    void updateEntityFromDto(ReciboSueldoDTO dto, @MappingTarget ReciboSueldo entity);
}
