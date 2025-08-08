package edu.ecep.base_app.util;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import lombok.Getter;
import lombok.Setter;

@Getter
public class ReferencedWarning {

    private final String key;
    private final List<Object> params = new ArrayList<>();

    public ReferencedWarning(String key) {
        this.key = key;
    }

    public void addParam(Object param) {
        params.add(param);
    }

    public String toMessage() {
        String message = key;
        if (!params.isEmpty()) {
            message += "," + params.stream()
                    .map(Object::toString)
                    .collect(Collectors.joining(","));
        }
        return message;
    }
}
