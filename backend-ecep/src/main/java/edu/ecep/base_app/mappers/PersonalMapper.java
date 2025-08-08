package edu.ecep.base_app.mappers;

import edu.ecep.base_app.domain.Personal;
import edu.ecep.base_app.dtos.PersonalDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

/* ========== PERSONAL ========== */
@Mapper(componentModel = "spring")
public interface PersonalMapper {
    PersonalDTO toDto(Personal entity);

    Personal toEntity(PersonalDTO dto);

    @Mapping(target = "id", ignore = true)
    void updateEntityFromDto(PersonalDTO dto, @MappingTarget Personal entity);
}
