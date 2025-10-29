package edu.ecep.base_app.shared.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.auditing.DateTimeProvider;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.MongoTransactionManager;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.convert.DefaultDbRefResolver;
import org.springframework.data.mongodb.core.convert.DefaultMongoTypeMapper;
import org.springframework.data.mongodb.core.convert.MappingMongoConverter;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;
import org.springframework.data.mongodb.core.mapping.MongoMappingContext;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import java.time.OffsetDateTime;
import java.util.Optional;

/**
 * Configuración base para MongoDB.
 * Habilita auditoría, transacciones multi-documento y elimina el atributo _class
 * de los documentos persistidos para mantenerlos limpios.
 */
@Configuration
@EnableMongoAuditing(dateTimeProviderRef = "mongoAuditingDateTimeProvider")
@EnableMongoRepositories(basePackages = "edu.ecep.base_app.comunicacion.infrastructure.persistence")
public class MongoConfig {

    @Bean(name = "mongoAuditingDateTimeProvider")
    public DateTimeProvider mongoAuditingDateTimeProvider() {
        return () -> Optional.of(OffsetDateTime.now());
    }

    @Bean
    public MappingMongoConverter mappingMongoConverter(MongoDatabaseFactory mongoDbFactory,
                                                       MongoMappingContext context,
                                                       MongoCustomConversions conversions) {
        MappingMongoConverter converter = new MappingMongoConverter(new DefaultDbRefResolver(mongoDbFactory), context);
        converter.setCustomConversions(conversions);
        converter.setTypeMapper(new DefaultMongoTypeMapper(null));
        converter.afterPropertiesSet();
        return converter;
    }

    @Bean
    public MongoTemplate mongoTemplate(MongoDatabaseFactory mongoDbFactory,
                                       MappingMongoConverter mappingMongoConverter) {
        return new MongoTemplate(mongoDbFactory, mappingMongoConverter);
    }

    @Configuration
    @EnableTransactionManagement
    @ConditionalOnProperty(prefix = "spring.data.mongodb.transactions", name = "enabled", havingValue = "true")
    static class MongoTransactionsConfig {

        @Bean
        public MongoTransactionManager mongoTransactionManager(MongoDatabaseFactory mongoDbFactory) {
            return new MongoTransactionManager(mongoDbFactory);
        }
    }
}
