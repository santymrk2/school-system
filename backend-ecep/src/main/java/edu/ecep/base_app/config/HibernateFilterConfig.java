package edu.ecep.base_app.config;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.hibernate.Session;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Aspect
@RequiredArgsConstructor
public class HibernateFilterConfig {

    private final EntityManager entityManager;

    @Before("@annotation(transactional)")
    public void enableActivoFilter(Transactional transactional) {
        Session session = entityManager.unwrap(Session.class);
        session.enableFilter("activoFilter").setParameter("activo", true);
    }
}

