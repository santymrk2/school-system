package edu.ecep.base_app.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;

@Data
public class LoginRequest {
    @NotBlank private String email;
    @NotBlank private String password;
}