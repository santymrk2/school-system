package edu.ecep.base_app.util;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ReferencedException.class)
    public ResponseEntity<Map<String, Object>> handleReferencedException(ReferencedException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("error", "ENTITY_REFERENCED");
        body.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(NotFoundException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("error", "NOT_FOUND");
        body.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String,Object>> handleUniqueConstraint(DataIntegrityViolationException ex) {
        String root = ex.getRootCause() != null ? ex.getRootCause().getMessage() : ex.getMessage();
        String message = "Violación de integridad de datos";
        String code    = "DATA_INTEGRITY";
        if (root != null && root.contains("duplicate key") && root.contains("dni")) {
            code    = "DUPLICATE_DNI";
            message = "Ya existe un aspirante con ese DNI";
        }
        Map<String,Object> body = new HashMap<>();
        body.put("error", code);
        body.put("message", message);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }
}

