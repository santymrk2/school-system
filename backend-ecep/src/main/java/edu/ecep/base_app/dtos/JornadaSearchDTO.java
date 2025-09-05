package edu.ecep.base_app.dtos;

import java.time.LocalDate;

public record JornadaSearchDTO(Long seccionId, Long trimestreId, LocalDate from, LocalDate to) {}
