# BaseApp

This app was created with Bootify.io - tips on working with the code [can be found here](https://bootify.io/next-steps/).

## Development

When starting the application `docker compose up` is called and the app will connect to the contained services.
[Docker](https://www.docker.com/get-started/) must be available on the current system.

During development it is recommended to use the profile `local`. In IntelliJ `-Dspring.profiles.active=local` can be
added in the VM options of the Run Configuration after enabling this property in "Modify options". Create your own
`application-local.yml` file to override settings for development.

Lombok must be supported by your IDE. For IntelliJ install the Lombok plugin and enable annotation processing -
[learn more](https://bootify.io/next-steps/spring-boot-with-lombok.html).

After starting the application it is accessible under `localhost:8080`.

### Configuración de correo saliente

Las notificaciones por email usan `JavaMailSender`. Para que los envíos
funcionen es necesario definir las siguientes propiedades (directamente en
`application.yml`, en un `application-<perfil>.yml` o a través de variables de
entorno):

| Propiedad                                 | Variable de entorno                | Descripción |
|-------------------------------------------|------------------------------------|-------------|
| `spring.mail.host`                        | `SPRING_MAIL_HOST`                 | Host o IP del servidor SMTP. |
| `spring.mail.port`                        | `SPRING_MAIL_PORT`                 | Puerto del servidor SMTP. |
| `spring.mail.username` / `spring.mail.password` | `SPRING_MAIL_USERNAME` / `SPRING_MAIL_PASSWORD` | Credenciales de autenticación si el servidor lo requiere. |
| `spring.mail.properties.mail.smtp.auth`   | `SPRING_MAIL_SMTP_AUTH`            | Debe ser `true` si el servidor exige autenticación. |
| `spring.mail.properties.mail.smtp.starttls.enable` | `SPRING_MAIL_SMTP_STARTTLS_ENABLE` | Activar `true` cuando el servidor requiera STARTTLS. |
| `app.notifications.mail.from`             | `APP_NOTIFICATIONS_MAIL_FROM`      | Dirección de correo que aparecerá como remitente. |
| `app.notifications.mail.enabled`          | `APP_NOTIFICATIONS_MAIL_ENABLED`   | Mantener en `true` para habilitar los envíos. |

En entornos de desarrollo se puede utilizar un servidor de pruebas como
[MailHog](https://github.com/mailhog/MailHog) configurando `SPRING_MAIL_HOST`
en `localhost` y `SPRING_MAIL_PORT` en el puerto expuesto por MailHog. Con la
bandera `APP_NOTIFICATIONS_MAIL_ENABLED=false` la aplicación mantiene la
lógica del flujo pero solo registra en logs que el envío está deshabilitado.

## Build

The application can be built using the following command:

```
mvnw clean package
```

Start your application with the following command - here with the profile `production`:

```
java -Dspring.profiles.active=production -jar ./target/base-app-0.0.1-SNAPSHOT.jar
```

If required, a Docker image can be created with the Spring Boot plugin. Add `SPRING_PROFILES_ACTIVE=production` as
environment variable when running the container.

```
mvnw spring-boot:build-image -Dspring-boot.build-image.imageName=edu.ecep/base-app
```

## Further readings

* [Maven docs](https://maven.apache.org/guides/index.html)  
* [Spring Boot reference](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/)  
* [Spring Data JPA reference](https://docs.spring.io/spring-data/jpa/reference/jpa.html)
