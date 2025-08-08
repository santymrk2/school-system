package edu.ecep.base_app.dtos;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class ComunicadoDTO {

    private Long id;

    @NotNull
    @Size(max = 255)
    private String titulo;

    @NotNull
    private String cuerpoMensaje;

    @NotNull
    @Size(max = 50)
    private String tipoComunicacion;

    @Size(max = 50)
    private String nivelDestino;

    private Long seccionDestino;

    @NotNull
    private Long publicador;

}
