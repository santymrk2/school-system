package edu.ecep.base_app.dtos;

import jakarta.validation.constraints.NotNull;

public record PersonaUsuarioLinkDTO(@NotNull Long usuarioId) {}

