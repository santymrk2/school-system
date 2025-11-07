# Autenticación, sesión y flujo de roles

Este documento resume cómo se orquesta la autenticación del frontend, qué hooks y contextos intervienen, y qué pantallas/redirecciones acompañan el flujo según los roles del usuario.

## Contexto de autenticación (`AuthContext`)

El contexto central está definido en `src/context/AuthContext.tsx`. Expone el usuario autenticado, el estado de carga y helpers para iniciar/cerrar sesión, elegir roles y verificar permisos.【F:frontend-ecep/src/context/AuthContext.tsx†L96-L311】

### Normalización de roles y usuario

* Cualquier payload recibido se parchea con `patchUserRoles` para garantizar que exista una propiedad `roles: string[]`, sin importar si la API envía `roles`, `userRoles` o `authorities`.【F:frontend-ecep/src/context/AuthContext.tsx†L23-L56】
* Los roles se normalizan mediante `normalizeRoles`, asegurando valores consistentes en mayúsculas y sin duplicados antes de exponerlos al resto de la app.【F:frontend-ecep/src/context/AuthContext.tsx†L163-L168】

### Persistencia local

* La selección de rol se conserva en `localStorage` bajo la clave `selectedRole`, utilizando `normalizeRole` al leer o escribir para evitar valores obsoletos. Cambiar de rol fuerza un `router.refresh()` para recalcular menús/permisos.【F:frontend-ecep/src/context/AuthContext.tsx†L133-L161】
* El token emitido por `login` se almacena en `localStorage` (usado por el interceptor HTTP) y además se replica como cookie accesible (`token`) para que el middleware de Next.js pueda proteger rutas privadas durante el desarrollo. El helper `writeTokenCookie` gestiona el dominio compartido y la caducidad (8 horas).【F:frontend-ecep/src/context/AuthContext.tsx†L171-L232】
* Durante el cierre de sesión se eliminan tanto el valor de `localStorage` como la cookie, y se limpia el rol seleccionado antes de redirigir al inicio.【F:frontend-ecep/src/context/AuthContext.tsx†L274-L288】

### Carga inicial y resguardo de rutas

* Al montarse, `AuthProvider` ejecuta `checkAuth` una sola vez para llamar a `identidad.me()`, parchear roles y restaurar la selección previa si todavía es válida. Si el backend responde con error, se resetea la sesión y, si el usuario estaba en una ruta protegida (`/dashboard` o `/select-rol`), se lo envía al login (`/`).【F:frontend-ecep/src/context/AuthContext.tsx†L170-L212】
* La utilidad `hasRole` permite comprobar permisos comparando contra el rol elegido o, en su defecto, contra la lista completa normalizada. Los administradores mantienen permisos elevados cuando existe un rol seleccionado.【F:frontend-ecep/src/context/AuthContext.tsx†L291-L298】

## Hooks relacionados

`useAuth` simplemente reexporta el hook del contexto, por lo que los componentes pueden consumir todas las capacidades anteriores sin importar su ubicación.【F:frontend-ecep/src/hooks/useAuth.tsx†L1-L1】

## Pantallas y redirecciones

### Login (`/`)

La página raíz consume `useAuth` para observar el estado actual:

* Si el usuario ya está autenticado, evalúa los roles disponibles. Con un rol seleccionado redirige directo a `/dashboard`; con varios roles deriva a `/select-rol`; sin roles muestra un aviso y permite cerrar sesión.【F:frontend-ecep/src/app/page.tsx†L81-L173】
* Para iniciar sesión ejecuta `login(email, password)`, dejando que `AuthContext` maneje la persistencia del token y los redireccionamientos posteriores.【F:frontend-ecep/src/app/page.tsx†L124-L138】

### Selección de rol (`/select-rol`)

* Redirige al login si no existe sesión activa, y resuelve automáticamente cuando el usuario tiene un único rol (lo selecciona y va al dashboard). Cuando hay múltiples roles, presenta botones para elegir uno; el rol elegido se persiste y dispara la navegación a `/dashboard`.【F:frontend-ecep/src/app/select-rol/page.tsx†L18-L82】

### Página de acceso denegado (`/unauthorized`)

* Renderiza un mensaje de error centrado indicando que la persona no posee permisos para la sección actual. Se puede utilizar como destino cuando `hasRole` falla en componentes o layouts específicos.【F:frontend-ecep/src/app/unauthorized/page.tsx†L1-L10】

### Middleware y protección de rutas

El middleware de Next.js intercepta las rutas bajo `/dashboard` y `/select-rol`, permitiendo el acceso únicamente si existe la cookie `token`. En ausencia del token redirige al login, lo que complementa las verificaciones que realiza el contexto en el cliente.【F:frontend-ecep/middleware.ts†L5-L20】

## Servicios y consumo de APIs

Los servicios de autenticación viven en `src/services/api` y reutilizan una instancia de Axios configurada.

* `http.ts` crea un cliente con `baseURL` configurable, adjunta el token de `localStorage` en la cabecera `Authorization` y agrega un header para omitir el aviso de ngrok. También ofrece logging detallado cuando `NEXT_PUBLIC_DEBUG` está activo.【F:frontend-ecep/src/services/api/http.ts†L1-L47】
* El módulo `identidad` agrupa las llamadas relacionadas con autenticación: `login` (POST `/api/auth/login`), `logout` (POST `/api/auth/logout`), `me` (GET `/api/auth/me`) y `checkEmail` (POST `/api/auth/check-email`). Estas funciones devuelven las promesas de Axios tipadas con los DTO generados.【F:frontend-ecep/src/services/api/modules/identidad/index.ts†L1-L29】【F:frontend-ecep/src/services/api/modules/identidad/auth.ts†L1-L12】

## Flujo resumido

1. `LoginPage` valida el correo y delega en `useAuth().login` para autenticar al usuario.【F:frontend-ecep/src/app/page.tsx†L104-L138】
2. `AuthContext` almacena el token en `localStorage` y como cookie, obtiene el perfil con `identidad.me()` y normaliza roles.【F:frontend-ecep/src/context/AuthContext.tsx†L221-L246】
3. Según la cantidad de roles, redirige al dashboard o a `/select-rol`; la selección persistida se restaura en montajes posteriores.【F:frontend-ecep/src/context/AuthContext.tsx†L186-L205】【F:frontend-ecep/src/app/select-rol/page.tsx†L26-L82】
4. Cualquier navegación a rutas protegidas sin token pasa por el middleware, que obliga a volver al login. Al cerrar sesión se limpian todos los rastros locales de la sesión.【F:frontend-ecep/middleware.ts†L5-L20】【F:frontend-ecep/src/context/AuthContext.tsx†L274-L288】
