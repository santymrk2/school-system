package edu.ecep.base_app.shared.config;

import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.ReadingConverter;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Date;

@ReadingConverter
enum OffsetDateTimeReadConverter implements Converter<Date, OffsetDateTime> {
    INSTANCE;

    @Override
    public OffsetDateTime convert(Date source) {
        if (source == null) {
            return null;
        }
        return OffsetDateTime.ofInstant(source.toInstant(), ZoneOffset.UTC);
    }
}
