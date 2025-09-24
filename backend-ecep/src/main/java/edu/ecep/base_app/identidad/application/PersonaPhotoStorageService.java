package edu.ecep.base_app.identidad.application;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class PersonaPhotoStorageService {

    private static final long MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
    private static final String SIZE_ERROR_MESSAGE = "La imagen de perfil supera el tamaño máximo de 2 MB";
    private static final String FORMAT_ERROR_MESSAGE = "Formato de imagen no soportado. Permitidos: JPG, PNG o WEBP";
    private static final Map<String, String> CONTENT_TYPE_EXTENSION = Map.of(
            "image/jpeg", ".jpg",
            "image/png", ".png",
            "image/webp", ".webp"
    );

    private final Path rootLocation;
    private final Path personasLocation;

    public PersonaPhotoStorageService(
            @Value("${app.storage.root:storage}") String rootDir,
            @Value("${app.storage.personas-subdir:personas}") String personasSubdir
    ) {
        this.rootLocation = Paths.get(rootDir).toAbsolutePath().normalize();
        this.personasLocation = this.rootLocation.resolve(personasSubdir).normalize();
        try {
            Files.createDirectories(this.personasLocation);
        } catch (IOException e) {
            throw new IllegalStateException("No se pudo inicializar el almacenamiento de fotos de personas", e);
        }
    }

    public StoredPhoto store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Seleccioná un archivo de imagen para continuar");
        }

        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new IllegalArgumentException(SIZE_ERROR_MESSAGE);
        }

        String extension = resolveExtension(file);
        if (extension == null) {
            throw new IllegalArgumentException(FORMAT_ERROR_MESSAGE);
        }

        String filename = UUID.randomUUID() + extension;
        Path destinationFile = personasLocation.resolve(filename).normalize();
        if (!destinationFile.getParent().equals(personasLocation)) {
            throw new IllegalArgumentException("Ruta de almacenamiento inválida");
        }

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new IllegalStateException("No se pudo guardar la imagen de perfil", e);
        }

        String relativePath = rootLocation.relativize(destinationFile).toString()
                .replace(File.separatorChar, '/');

        return new StoredPhoto(filename, relativePath, file.getSize());
    }

    private String resolveExtension(MultipartFile file) {
        String contentType = Optional.ofNullable(file.getContentType())
                .map(value -> value.toLowerCase(Locale.ROOT))
                .orElse("");

        String extension = CONTENT_TYPE_EXTENSION.get(contentType);
        if (extension != null) {
            return extension;
        }

        String originalName = Optional.ofNullable(file.getOriginalFilename())
                .map(StringUtils::cleanPath)
                .orElse("")
                .toLowerCase(Locale.ROOT);

        if (originalName.endsWith(".jpg") || originalName.endsWith(".jpeg")) {
            return ".jpg";
        }
        if (originalName.endsWith(".png")) {
            return ".png";
        }
        if (originalName.endsWith(".webp")) {
            return ".webp";
        }
        return null;
    }

    public record StoredPhoto(String fileName, String relativePath, long size) {
    }
}
