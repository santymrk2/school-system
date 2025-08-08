package edu.ecep.base_app.dtos;

import lombok.Data;

@Data
public class RegistroAsistenciaDTO {
    private Long id;
    private Long asistenciaDiaId;
    private Long matriculaId;
    private Boolean presente;
    private String justificacion;
}
