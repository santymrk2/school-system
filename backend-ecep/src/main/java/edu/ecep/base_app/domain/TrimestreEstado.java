package edu.ecep.base_app.domain;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum TrimestreEstado {
    INACTIVO,
    ACTIVO,
    CERRADO;

    @JsonValue
    public String toJson() {
        return name().toLowerCase();
    }

    @JsonCreator
    public static TrimestreEstado fromJson(String value) {
        if (value == null) {
            return null;
        }
        return switch (value.trim().toLowerCase()) {
            case "activo" -> ACTIVO;
            case "cerrado" -> CERRADO;
            case "inactivo" -> INACTIVO;
            default -> throw new IllegalArgumentException("Estado de trimestre desconocido: " + value);
        };
    }
}
