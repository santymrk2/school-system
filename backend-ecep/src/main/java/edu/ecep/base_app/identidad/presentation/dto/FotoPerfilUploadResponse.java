package edu.ecep.base_app.identidad.presentation.dto;

public record FotoPerfilUploadResponse(
        String url,
        String fileName,
        long size
) {
}
