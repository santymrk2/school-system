package edu.ecep.base_app.shared.domain.enums;


public enum Turno {
    MANANA,
    TARDE;

    public String getDisplayName() {
        return switch (this) {
            case MANANA -> "Mañana";
            case TARDE -> "Tarde";
        };
    }
}
