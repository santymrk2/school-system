package edu.ecep.base_app.identidad.presentation.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class EmailCheckRequest {
    @NotBlank
    @Email
    private String email;
}
