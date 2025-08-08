package edu.ecep.base_app.mappers;

import edu.ecep.base_app.domain.Cuota;
import edu.ecep.base_app.dtos.CuotaDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

/* ========== CUOTA ========== */
@Mapper(componentModel = "spring")
public interface CuotaMapper {
    @Mapping(source = "seccion.id", target = "seccionId")
    CuotaDTO toDto(Cuota entity);

    @Mapping(target = "seccion", ignore = true)
    Cuota toEntity(CuotaDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "seccion", ignore = true)
    void updateEntityFromDto(CuotaDTO dto, @MappingTarget Cuota entity);}
