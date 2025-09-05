package edu.ecep.base_app.mappers;

import org.mapstruct.MapperConfig;
import org.mapstruct.ReportingPolicy;

// =============================================================
// Config + helper de referencias (IDs -> entidades con sólo id)
// =============================================================
@MapperConfig(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
interface ModelMapperConfig {
}
