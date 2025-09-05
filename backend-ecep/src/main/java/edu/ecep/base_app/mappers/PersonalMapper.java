package edu.ecep.base_app.mappers;

import edu.ecep.base_app.domain.Personal;
import edu.ecep.base_app.dtos.PersonalCreateDTO;
import edu.ecep.base_app.dtos.PersonalDTO;
import edu.ecep.base_app.dtos.PersonalUpdateDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface PersonalMapper {

    // Lectura
    PersonalDTO toDto(Personal e);

    // Alta (CreateDTO -> entidad)
    Personal toEntity(PersonalCreateDTO dto);

    // Update parcial: ignora nulos para no pisar valores existentes
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    void update(@MappingTarget Personal entity, PersonalUpdateDTO dto);
}
