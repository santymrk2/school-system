package edu.ecep.base_app.shared.exception;

public class DuplicateDniException extends RuntimeException {
    public DuplicateDniException(String message) {
        super(message);
    }
}