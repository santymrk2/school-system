package edu.ecep.base_app.dtos;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SendMessageRequest {
    @NotBlank
    private String contenido;
    @NotNull
    private Long receptorId;
}
