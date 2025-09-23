package edu.ecep.base_app.gestionacademica.infrastructure.mapper;

import edu.ecep.base_app.gestionacademica.domain.Trimestre;
import edu.ecep.base_app.gestionacademica.presentation.dto.TrimestreCreateDTO;
import edu.ecep.base_app.gestionacademica.presentation.dto.TrimestreDTO;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Mappings;
import org.mapstruct.NullValuePropertyMappingStrategy;
import edu.ecep.base_app.shared.mapper.ModelMapperConfig;
import edu.ecep.base_app.shared.mapper.RefMapper;

@Mapper(config = ModelMapperConfig.class, uses = RefMapper.class)
public interface TrimestreMapper {

    @Mapping(target = "periodoEscolarId", source = "periodoEscolar.id")
    TrimestreDTO toDto(Trimestre entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "dateCreated", ignore = true)
    @Mapping(target = "lastUpdated", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "modifiedBy", ignore = true)
    @Mapping(target = "activo", ignore = true)
    @Mapping(target = "fechaEliminacion", ignore = true)
    @Mapping(target = "estado", ignore = true)
    @Mapping(target = "periodoEscolar", source = "periodoEscolarId")
    Trimestre toEntity(TrimestreCreateDTO dto);

    // Merge de campos no nulos desde DTO -> entity, sin tocar id/cerrado/BaseEntity
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mappings({
            @Mapping(target = "id", ignore = true),
            @Mapping(target = "estado", ignore = true),
            @Mapping(target = "dateCreated", ignore = true),
            @Mapping(target = "lastUpdated", ignore = true),
            @Mapping(target = "createdBy", ignore = true),
            @Mapping(target = "modifiedBy", ignore = true),
            @Mapping(target = "activo", ignore = true),
            @Mapping(target = "fechaEliminacion", ignore = true),
            @Mapping(target = "periodoEscolar", ignore = true)
    })
    void updateEntityFromDto(TrimestreDTO dto, @MappingTarget Trimestre entity);
}
