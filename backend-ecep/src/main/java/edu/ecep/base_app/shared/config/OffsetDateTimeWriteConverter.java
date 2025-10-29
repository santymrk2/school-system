package edu.ecep.base_app.shared.config;

import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.WritingConverter;

import java.time.OffsetDateTime;
import java.util.Date;

@WritingConverter
enum OffsetDateTimeWriteConverter implements Converter<OffsetDateTime, Date> {
    INSTANCE;

    @Override
    public Date convert(OffsetDateTime source) {
        if (source == null) {
            return null;
        }
        return Date.from(source.toInstant());
    }
}
