package edu.ecep.base_app.mappers;

import edu.ecep.base_app.domain.Trimestre;
import edu.ecep.base_app.dtos.TrimestreCreateDTO;
import edu.ecep.base_app.dtos.TrimestreDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;


import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface TrimestreMapper {

    TrimestreDTO toDto(Trimestre entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "dateCreated", ignore = true)
    @Mapping(target = "lastUpdated", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "modifiedBy", ignore = true)
    @Mapping(target = "activo", ignore = true)
    @Mapping(target = "fechaEliminacion", ignore = true)
    @Mapping(target = "cerrado", ignore = true)
    Trimestre toEntity(TrimestreCreateDTO dto);

    // Merge de campos no nulos desde DTO -> entity, sin tocar id/cerrado/BaseEntity
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mappings({
            @Mapping(target = "id", ignore = true),
            @Mapping(target = "cerrado", ignore = true),
            @Mapping(target = "dateCreated", ignore = true),
            @Mapping(target = "lastUpdated", ignore = true),
            @Mapping(target = "createdBy", ignore = true),
            @Mapping(target = "modifiedBy", ignore = true),
            @Mapping(target = "activo", ignore = true),
            @Mapping(target = "fechaEliminacion", ignore = true)
    })
    void updateEntityFromDto(TrimestreDTO dto, @MappingTarget Trimestre entity);
}
