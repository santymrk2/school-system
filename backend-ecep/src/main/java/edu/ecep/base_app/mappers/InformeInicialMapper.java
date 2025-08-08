package edu.ecep.base_app.mappers;

import edu.ecep.base_app.domain.InformeInicial;
import edu.ecep.base_app.dtos.InformeInicialDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

/* ========== INFORME INICIAL ========== */
@Mapper(componentModel = "spring")
public interface InformeInicialMapper {
    @Mapping(source = "matricula.id", target = "matriculaId")
    @Mapping(source = "reportadoPor.id", target = "reportadoPorId")
    InformeInicialDTO toDto(InformeInicial entity);

    @Mapping(target = "matricula", ignore = true)
    @Mapping(target = "reportadoPor", ignore = true)
    InformeInicial toEntity(InformeInicialDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "matricula", ignore = true)
    @Mapping(target = "reportadoPor", ignore = true)
    void updateEntityFromDto(InformeInicialDTO dto, @MappingTarget InformeInicial entity);
}
