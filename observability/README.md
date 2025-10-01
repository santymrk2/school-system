# Observabilidad con Vector

Este directorio contiene la configuración de [Vector](https://vector.dev/), el agente de recolección y ruteo de logs
utilizado para desacoplar el almacenamiento de logs de los servicios principales.

## Flujo

1. El frontend (Node.js) serializa cada evento con Pino y lo reenvía desde un _worker_ dedicado (via `pino.transport`) a Vector a través de HTTP (`http://vector:9000/logs`).
2. El backend Spring Boot publica sus logs estructurados mediante un _appender_ TCP asíncrono (`vector:6000`) sin escribir a `stdout`.
3. Vector también se conecta al socket de Docker para capturar los logs estándar de los contenedores de infraestructura listados en `vector.yaml`.
4. Si Vector detecta payloads JSON (incluyendo los recibidos por red) los normaliza y enriquece con metadatos del contenedor o del emisor.
5. El resultado se envía a:
   - Un archivo local (`observability/logs/application.log`) para retención.
   - La salida estándar del contenedor de Vector (útil durante el desarrollo).
   - Un endpoint Prometheus (`http://localhost:9598/metrics`) que expone métricas básicas de logging.

La API de Vector queda disponible en `http://localhost:8686` para inspeccionar el pipeline y reenviar eventos. El _playground_ de datos sintéticos permanece deshabilitado para que solo se muestren eventos reales.

## Cobertura de servicios

Los orígenes `remote_http` y `remote_tcp` reciben eventos directamente del frontend y backend respectivamente. El origen
`docker_logs` permanece habilitado para servicios auxiliares (PostgreSQL, Redis, Cloudflared) que continúan emitiendo por `stdout`.

Los logs enviados por el backend incluyen metadatos como `logger`, `thread` y `@timestamp`. Vector los renombra para
mantener un esquema uniforme con el resto de eventos.

Si agregas nuevos servicios solo tienes que incorporarlos a la lista `include_containers` dentro de `vector.yaml`.

## Visualización de los logs

Puedes consumir los logs centralizados de varias maneras:

- **Desde la línea de comandos**: `docker compose -f docker-compose.dev.yml logs -f vector` mostrará la salida del
  contenedor de Vector, que reemite los eventos normalizados en tiempo real.
- **Desde archivos locales**: `tail -f observability/logs/application.log` permite revisar el archivo JSON que Vector
  persiste en tu máquina para posteriores análisis o ingestas.
- **Desde la API de Vector**: visita `http://localhost:8686` en tu navegador para inspeccionar el estado del agente
  o reenviar eventos a endpoints HTTP, y consulta las métricas de ingesta en `http://localhost:9598/metrics` con tu
  colector Prometheus favorito.
- **Para pruebas puntuales**: envía un `POST` con JSON a `http://localhost:9000/logs` o un mensaje TCP a
  `localhost:6000` para verificar que la ingesta remota está funcionando.

Estas opciones funcionan tanto para los logs del frontend como para los del backend dado que ambos fluyen a través de
Vector, ya sea por red o por la lectura de `stdout`.

## Uso

```bash
docker compose -f docker-compose.dev.yml up vector
```

Vector arrancará junto con el resto de servicios definidos en el `docker-compose.dev.yml`. Si deseas ejecutarlo de
forma aislada, puedes levantar únicamente los servicios necesarios (por ejemplo, `backend`, `frontend` y `vector`). Para
que los servicios encuentren al colector recuerda exportar las variables `VECTOR_HTTP_ENDPOINT` (frontend) y
`VECTOR_LOG_HOST`/`VECTOR_LOG_TCP_PORT` (backend) cuando ejecutes las aplicaciones fuera de Docker.

Los archivos generados dentro de `observability/logs` se ignoran en Git para evitar subir datos sensibles.

## Impacto en el uso de recursos de frontend y backend

Esta arquitectura **centraliza** los logs y delega el I/O en transportes remotos asíncronos. El frontend ejecuta el
`transport` de Pino en un hilo independiente y el backend usa un `AsyncAppender` que escribe únicamente hacia Vector,
liberando a ambos procesos del trabajo de E/S y evitando duplicar salidas en consola. Además:

- El frontend limita su nivel por defecto a `info` (puede elevarse via `NEXT_PUBLIC_LOG_LEVEL` cuando se requiera), lo que
  reduce la serialización innecesaria de eventos verbosos.
- El backend mantiene los paquetes de Redis en `WARN` por defecto (`APP_LOG_LEVEL_LETTUCE` y `APP_LOG_LEVEL_SPRING_REDIS`
  permiten subir el nivel puntualmente) para que la ingesta normal no sature la aplicación.

El formateo mínimo requerido continúa ocurriendo en cada servicio (no es posible evitarlo sin dejar de registrar
información), pero la transmisión y almacenamiento se realizan fuera de los contenedores de aplicación.
