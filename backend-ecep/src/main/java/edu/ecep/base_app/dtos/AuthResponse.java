package edu.ecep.base_app.dtos;

import edu.ecep.base_app.domain.enums.UserRole;
import lombok.Getter;

import java.util.Set;

@Getter
public class AuthResponse {
    private String token;
    private String email;
    private Set<UserRole> userRoles;

    public AuthResponse(String token, String email, Set<UserRole> userRoles) {
        this.token = token;
        this.email = email;
        this.userRoles = userRoles;
    }
}
