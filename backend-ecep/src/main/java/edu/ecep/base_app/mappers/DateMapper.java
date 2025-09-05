package edu.ecep.base_app.mappers;

import org.springframework.stereotype.Component;
import java.time.*;

@Component
public class DateMapper {
    public OffsetDateTime toOffsetDateTime(LocalDateTime v) {
        return v == null ? null : v.atZone(ZoneId.systemDefault()).toOffsetDateTime();
    }
    public LocalDateTime toLocalDateTime(OffsetDateTime v) {
        return v == null ? null : v.atZoneSameInstant(ZoneId.systemDefault()).toLocalDateTime();
    }
}

