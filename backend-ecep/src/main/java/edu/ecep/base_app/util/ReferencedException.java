package edu.ecep.base_app.util;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;


@ResponseStatus(HttpStatus.CONFLICT)
public class ReferencedException extends RuntimeException {

    public ReferencedException(ReferencedWarning referencedWarning) {
        super(referencedWarning.toMessage());
    }
}
