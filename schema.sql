--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5 (Debian 17.5-1.pgdg120+1)
-- Dumped by pg_dump version 17.5 (Debian 17.5-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: actas_accidente; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.actas_accidente (
    id bigint NOT NULL,
    activo boolean NOT NULL,
    created_by character varying(255),
    date_created timestamp with time zone NOT NULL,
    fecha_eliminacion timestamp(6) with time zone,
    last_updated timestamp with time zone NOT NULL,
    modified_by character varying(255),
    acciones_tomadas text,
    descripcion text NOT NULL,
    fecha_accidente timestamp(6) with time zone NOT NULL,
    lugar character varying(255),
    alumno_involucrado_id bigint,
    creado_por_id bigint,
    matricula_id bigint
);


ALTER TABLE public.actas_accidente OWNER TO postgres;

--
-- Name: alumno_familiar; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.alumno_familiar (
    id bigint NOT NULL,
    activo boolean NOT NULL,
    created_by character varying(255),
    date_created timestamp with time zone NOT NULL,
    fecha_eliminacion timestamp(6) with time zone,
    last_updated timestamp with time zone NOT NULL,
    modified_by character varying(255),
    tipo_relacion character varying(50) NOT NULL,
    vive_con_alumno boolean NOT NULL,
    alumno_id bigint NOT NULL,
    familiar_id bigint NOT NULL
);


ALTER TABLE public.alumno_familiar OWNER TO postgres;

--
-- Name: asignaciones_docentes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asignaciones_docentes (
    id bigint NOT NULL,
    activo boolean NOT NULL,
    created_by character varying(255),
    date_created timestamp with time zone NOT NULL,
    fecha_eliminacion timestamp(6) with time zone,
    last_updated timestamp with time zone NOT NULL,
    modified_by character varying(255),
    es_titular boolean NOT NULL,
    fecha_fin date,
    fecha_inicio date,
    observaciones text,
    personal_id bigint NOT NULL,
    materia_id bigint,
    seccion_id bigint NOT NULL
);


ALTER TABLE public.asignaciones_docentes OWNER TO postgres;

--
-- Name: asistencia_personal; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asistencia_personal (
    id bigint NOT NULL,
    activo boolean NOT NULL,
    created_by character varying(255),
    date_created timestamp with time zone NOT NULL,
    fecha_eliminacion timestamp(6) with time zone,
    last_updated timestamp with time zone NOT NULL,
    modified_by character varying(255),
    falta boolean,
    fecha date NOT NULL,
    hora_entrada time(6) without time zone,
    hora_salida time(6) without time zone,
    justificada boolean,
    motivo character varying(255),
    personal_id bigint NOT NULL
);


ALTER TABLE public.asistencia_personal OWNER TO postgres;

--
-- Name: asistencias_dias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asistencias_dias (
    id bigint NOT NULL,
    activo boolean NOT NULL,
    created_by character varying(255),
    date_created timestamp with time zone NOT NULL,
    fecha_eliminacion timestamp(6) with time zone,
    last_updated timestamp with time zone NOT NULL,
    modified_by character varying(255),
    fecha date NOT NULL,
    seccion_id bigint NOT NULL
);


ALTER TABLE public.asistencias_dias OWNER TO postgres;

--
-- Name: aspirantes_familiares; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.aspirantes_familiares (
    id bigint NOT NULL,
    activo boolean NOT NULL,
    created_by character varying(255),
    date_created timestamp with time zone NOT NULL,
    fecha_eliminacion timestamp(6) with time zone,
    last_updated timestamp with time zone NOT NULL,
    modified_by character varying(255),
    tipo_relacion character varying(50) NOT NULL,
    vive_con_alumno boolean NOT NULL,
    aspirante_id bigint NOT NULL,
    familiar_id bigint NOT NULL
);


ALTER TABLE public.aspirantes_familiares OWNER TO postgres;

--
-- Name: calificaciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.calificaciones (
    id bigint NOT NULL,
    activo boolean NOT NULL,
    created_by character varying(255),
    date_created timestamp with time zone NOT NULL,
    fecha_eliminacion timestamp(6) with time zone,
    last_updated timestamp with time zone NOT NULL,
    modified_by character varying(255),
    fecha date NOT NULL,
    observaciones character varying(1000),
    valor character varying(255) NOT NULL,
    materia_id bigint NOT NULL,
    matricula_id bigint
);


ALTER TABLE public.calificaciones OWNER TO postgres;

--
-- Name: comunicados; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comunicados (
    id bigint NOT NULL,
    activo boolean NOT NULL,
    created_by character varying(255),
    date_created timestamp with time zone NOT NULL,
    fecha_eliminacion timestamp(6) with time zone,
    last_updated timestamp with time zone NOT NULL,
    modified_by character varying(255),
    cuerpo_mensaje text NOT NULL,
    nivel_destino character varying(50),
    tipo_comunicacion character varying(50) NOT NULL,
    titulo character varying(255) NOT NULL,
    publicador_id bigint NOT NULL,
    seccion_destino_id bigint
);


ALTER TABLE public.comunicados OWNER TO postgres;

--
-- Name: cuotas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cuotas (
    id bigint NOT NULL,
    activo boolean NOT NULL,
    created_by character varying(255),
    date_created timestamp with time zone NOT NULL,
    fecha_eliminacion timestamp(6) with time zone,
    last_updated timestamp with time zone NOT NULL,
    modified_by character varying(255),
    fecha_emision date NOT NULL,
    fecha_vencimiento date NOT NULL,
    monto numeric(10,2) NOT NULL,
    nivel_academico character varying(50),
    nombre character varying(255) NOT NULL,
    turno character varying(255),
    seccion_id bigint,
    CONSTRAINT cuotas_turno_check CHECK (((turno)::text = ANY ((ARRAY['MANANA'::character varying, 'TARDE'::character varying])::text[])))
);


ALTER TABLE public.cuotas OWNER TO postgres;

--
-- Name: dias_no_habiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dias_no_habiles (
    id bigint NOT NULL,
    activo boolean NOT NULL,
    created_by character varying(255),
    date_created timestamp with time zone NOT NULL,
    fecha_eliminacion timestamp(6) with time zone,
    last_updated timestamp with time zone NOT NULL,
    modified_by character varying(255),
    descripcion character varying(255),
    fecha date NOT NULL
);


ALTER TABLE public.dias_no_habiles OWNER TO postgres;

--
-- Name: evaluaciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.evaluaciones (
    id bigint NOT NULL,
    activo boolean NOT NULL,
    created_by character varying(255),
    date_created timestamp with time zone NOT NULL,
    fecha_eliminacion timestamp(6) with time zone,
    last_updated timestamp with time zone NOT NULL,
    modified_by character varying(255),
    descripcion character varying(1000),
    fecha date NOT NULL,
    tipo character varying(50),
    materia_id bigint NOT NULL,
    seccion_id bigint NOT NULL
);


ALTER TABLE public.evaluaciones OWNER TO postgres;

--
-- Name: formaciones_academicas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.formaciones_academicas (
    id bigint NOT NULL,
    activo boolean NOT NULL,
    created_by character varying(255),
    date_created timestamp with time zone NOT NULL,
    fecha_eliminacion timestamp(6) with time zone,
    last_updated timestamp with time zone NOT NULL,
    modified_by character varying(255),
    fecha_fin date,
    fecha_inicio date,
    institucion character varying(255) NOT NULL,
    nivel character varying(100) NOT NULL,
    titulo_obtenido character varying(255)
);


ALTER TABLE public.formaciones_academicas OWNER TO postgres;

--
-- Name: informes_trimestrales; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.informes_trimestrales (
    id bigint NOT NULL,
    activo boolean NOT NULL,
    created_by character varying(255),
    date_created timestamp with time zone NOT NULL,
    fecha_eliminacion timestamp(6) with time zone,
    last_updated timestamp with time zone NOT NULL,
    modified_by character varying(255),
    contenido text NOT NULL,
    fecha date NOT NULL,
    trimestre character varying(20) NOT NULL,
    matricula_id bigint,
    reportado_por_id bigint NOT NULL
);


ALTER TABLE public.informes_trimestrales OWNER TO postgres;

--
-- Name: licencias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.licencias (
    id bigint NOT NULL,
    activo boolean NOT NULL,
    created_by character varying(255),
    date_created timestamp with time zone NOT NULL,
    fecha_eliminacion timestamp(6) with time zone,
    last_updated timestamp with time zone NOT NULL,
    modified_by character varying(255),
    fecha_fin date NOT NULL,
    fecha_inicio date NOT NULL,
    motivo character varying(1000),
    tipo_licencia character varying(50) NOT NULL,
    personal_id bigint NOT NULL
);


ALTER TABLE public.licencias OWNER TO postgres;

--
-- Name: materias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.materias (
    id bigint NOT NULL,
    activo boolean NOT NULL,
    created_by character varying(255),
    date_created timestamp with time zone NOT NULL,
    fecha_eliminacion timestamp(6) with time zone,
    last_updated timestamp with time zone NOT NULL,
    modified_by character varying(255),
    nivel_academico character varying(50) NOT NULL,
    nombre character varying(255) NOT NULL
);


ALTER TABLE public.materias OWNER TO postgres;

--
-- Name: matriculas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.matriculas (
    id bigint NOT NULL,
    activo boolean NOT NULL,
    created_by character varying(255),
    date_created timestamp with time zone NOT NULL,
    fecha_eliminacion timestamp(6) with time zone,
    last_updated timestamp with time zone NOT NULL,
    modified_by character varying(255),
    anio_lectivo integer NOT NULL,
    estado character varying(20) NOT NULL,
    fecha_fin date,
    fecha_inicio date,
    alumno_id bigint NOT NULL,
    seccion_id bigint NOT NULL,
    CONSTRAINT matriculas_estado_check CHECK (((estado)::text = ANY ((ARRAY['REGULAR'::character varying, 'REPITE'::character varying, 'EGRESO'::character varying, 'BAJA'::character varying, 'EN_CURSO'::character varying])::text[])))
);


ALTER TABLE public.matriculas OWNER TO postgres;

--
-- Name: mensajes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mensajes (
    id bigint NOT NULL,
    activo boolean NOT NULL,
    created_by character varying(255),
    date_created timestamp with time zone NOT NULL,
    fecha_eliminacion timestamp(6) with time zone,
    last_updated timestamp with time zone NOT NULL,
    modified_by character varying(255),
    asunto character varying(255),
    contenido text NOT NULL,
    fecha_envio timestamp(6) with time zone NOT NULL,
    leido boolean NOT NULL,
    emisor_id bigint NOT NULL,
    receptor_id bigint NOT NULL
);


ALTER TABLE public.mensajes OWNER TO postgres;

--
-- Name: pagos_cuotas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pagos_cuotas (
    id bigint NOT NULL,
    activo boolean NOT NULL,
    created_by character varying(255),
    date_created timestamp with time zone NOT NULL,
    fecha_eliminacion timestamp(6) with time zone,
    last_updated timestamp with time zone NOT NULL,
    modified_by character varying(255),
    fecha_pago date NOT NULL,
    medio_pago character varying(50),
    monto_pagado numeric(10,2) NOT NULL,
    cuota_id bigint NOT NULL,
    matricula_id bigint
);


ALTER TABLE public.pagos_cuotas OWNER TO postgres;

--
-- Name: persona; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.persona (
    tipo character varying(31) NOT NULL,
    id bigint NOT NULL,
    activo boolean NOT NULL,
    created_by character varying(255),
    date_created timestamp with time zone NOT NULL,
    fecha_eliminacion timestamp(6) with time zone,
    last_updated timestamp with time zone NOT NULL,
    modified_by character varying(255),
    apellido character varying(255) NOT NULL,
    celular character varying(255),
    dni character varying(20) NOT NULL,
    domicilio character varying(500),
    email_contacto character varying(255),
    estado_civil character varying(255),
    fecha_nacimiento date,
    foto_perfil_url character varying(255),
    genero character varying(255),
    nacionalidad character varying(255),
    nombre character varying(255) NOT NULL,
    telefono character varying(255),
    fecha_inscripcion date,
    motivo_rechazo_baja character varying(255),
    observaciones_generales character varying(500),
    cobertura_medica character varying(255),
    conectividad_internet character varying(50),
    curso_solicitado character varying(255),
    dispositivos_disponibles character varying(255),
    enfermedades_alergias character varying(1000),
    escuela_actual character varying(255),
    idiomas_hablados_hogar character varying(255),
    limitaciones_fisicas character varying(255),
    medicacion_habitual character varying(255),
    observaciones_salud character varying(1000),
    tratamientos_terapeuticos character varying(255),
    turno_preferido character varying(255),
    uso_ayudas_movilidad boolean,
    ocupacion character varying(255),
    antecedentes_laborales character varying(1000),
    cargo character varying(50),
    condicion_laboral character varying(50),
    fecha_ingreso date,
    situacion_actual character varying(50),
    usuario_id bigint,
    CONSTRAINT persona_curso_solicitado_check CHECK (((curso_solicitado)::text = ANY ((ARRAY['PRIMERO'::character varying, 'SEGUNDO'::character varying, 'TERCERO'::character varying, 'CUARTO'::character varying, 'QUINTO'::character varying, 'SEXTO'::character varying, 'SALA_4'::character varying, 'SALA_5'::character varying])::text[]))),
    CONSTRAINT persona_turno_preferido_check CHECK (((turno_preferido)::text = ANY ((ARRAY['MANANA'::character varying, 'TARDE'::character varying])::text[])))
);


ALTER TABLE public.persona OWNER TO postgres;

--
-- Name: recibos_sueldos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recibos_sueldos (
    id bigint NOT NULL,
    activo boolean NOT NULL,
    created_by character varying(255),
    date_created timestamp with time zone NOT NULL,
    fecha_eliminacion timestamp(6) with time zone,
    last_updated timestamp with time zone NOT NULL,
    modified_by character varying(255),
    detalles text,
    fecha_emision date NOT NULL,
    monto_bruto numeric(12,2) NOT NULL,
    monto_neto numeric(12,2) NOT NULL,
    periodo character varying(20) NOT NULL,
    personal_id bigint NOT NULL
);


ALTER TABLE public.recibos_sueldos OWNER TO postgres;

--
-- Name: registro_asistencias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.registro_asistencias (
    id bigint NOT NULL,
    activo boolean NOT NULL,
    created_by character varying(255),
    date_created timestamp with time zone NOT NULL,
    fecha_eliminacion timestamp(6) with time zone,
    last_updated timestamp with time zone NOT NULL,
    modified_by character varying(255),
    hora_ingreso time(6) without time zone,
    hora_salida time(6) without time zone,
    presente boolean NOT NULL,
    asistencia_dia_id bigint NOT NULL,
    matricula_id bigint
);


ALTER TABLE public.registro_asistencias OWNER TO postgres;

--
-- Name: secciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.secciones (
    id bigint NOT NULL,
    activo boolean NOT NULL,
    created_by character varying(255),
    date_created timestamp with time zone NOT NULL,
    fecha_eliminacion timestamp(6) with time zone,
    last_updated timestamp with time zone NOT NULL,
    modified_by character varying(255),
    anio_lectivo integer NOT NULL,
    grado integer,
    nivel_academico character varying(50) NOT NULL,
    nombre character varying(255) NOT NULL,
    turno character varying(255),
    CONSTRAINT secciones_turno_check CHECK (((turno)::text = ANY ((ARRAY['MANANA'::character varying, 'TARDE'::character varying])::text[])))
);


ALTER TABLE public.secciones OWNER TO postgres;

--
-- Name: seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.seq
    START WITH 1
    INCREMENT BY 50
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.seq OWNER TO postgres;

--
-- Name: solicitudes_admisiones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.solicitudes_admisiones (
    id bigint NOT NULL,
    activo boolean NOT NULL,
    created_by character varying(255),
    date_created timestamp with time zone NOT NULL,
    fecha_eliminacion timestamp(6) with time zone,
    last_updated timestamp with time zone NOT NULL,
    modified_by character varying(255),
    autorizado_comunicaciones_email boolean,
    email_confirmacion_enviado boolean,
    entrevista_realizada boolean,
    estado character varying(50) NOT NULL,
    fecha_entrevista date,
    motivo_rechazo character varying(1000),
    aspirante_id bigint NOT NULL
);


ALTER TABLE public.solicitudes_admisiones OWNER TO postgres;

--
-- Name: usuario_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuario_roles (
    usuario_id bigint NOT NULL,
    role character varying(255),
    CONSTRAINT usuario_roles_role_check CHECK (((role)::text = ANY ((ARRAY['USER'::character varying, 'ADMIN'::character varying, 'STUDENT'::character varying, 'FAMILY'::character varying, 'TEACHER'::character varying, 'DIRECTOR'::character varying, 'SECRETARY'::character varying, 'COORDINATOR'::character varying, 'ALTERNATE'::character varying])::text[])))
);


ALTER TABLE public.usuario_roles OWNER TO postgres;

--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id bigint NOT NULL,
    activo boolean NOT NULL,
    created_by character varying(255),
    date_created timestamp with time zone NOT NULL,
    fecha_eliminacion timestamp(6) with time zone,
    last_updated timestamp with time zone NOT NULL,
    modified_by character varying(255),
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- Name: actas_accidente actas_accidente_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actas_accidente
    ADD CONSTRAINT actas_accidente_pkey PRIMARY KEY (id);


--
-- Name: alumno_familiar alumno_familiar_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alumno_familiar
    ADD CONSTRAINT alumno_familiar_pkey PRIMARY KEY (id);


--
-- Name: asignaciones_docentes asignaciones_docentes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asignaciones_docentes
    ADD CONSTRAINT asignaciones_docentes_pkey PRIMARY KEY (id);


--
-- Name: asistencia_personal asistencia_personal_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asistencia_personal
    ADD CONSTRAINT asistencia_personal_pkey PRIMARY KEY (id);


--
-- Name: asistencias_dias asistencias_dias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asistencias_dias
    ADD CONSTRAINT asistencias_dias_pkey PRIMARY KEY (id);


--
-- Name: aspirantes_familiares aspirantes_familiares_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aspirantes_familiares
    ADD CONSTRAINT aspirantes_familiares_pkey PRIMARY KEY (id);


--
-- Name: calificaciones calificaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calificaciones
    ADD CONSTRAINT calificaciones_pkey PRIMARY KEY (id);


--
-- Name: comunicados comunicados_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comunicados
    ADD CONSTRAINT comunicados_pkey PRIMARY KEY (id);


--
-- Name: cuotas cuotas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuotas
    ADD CONSTRAINT cuotas_pkey PRIMARY KEY (id);


--
-- Name: dias_no_habiles dias_no_habiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dias_no_habiles
    ADD CONSTRAINT dias_no_habiles_pkey PRIMARY KEY (id);


--
-- Name: evaluaciones evaluaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluaciones
    ADD CONSTRAINT evaluaciones_pkey PRIMARY KEY (id);


--
-- Name: formaciones_academicas formaciones_academicas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.formaciones_academicas
    ADD CONSTRAINT formaciones_academicas_pkey PRIMARY KEY (id);


--
-- Name: informes_trimestrales informes_trimestrales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.informes_trimestrales
    ADD CONSTRAINT informes_trimestrales_pkey PRIMARY KEY (id);


--
-- Name: licencias licencias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.licencias
    ADD CONSTRAINT licencias_pkey PRIMARY KEY (id);


--
-- Name: materias materias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materias
    ADD CONSTRAINT materias_pkey PRIMARY KEY (id);


--
-- Name: matriculas matriculas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.matriculas
    ADD CONSTRAINT matriculas_pkey PRIMARY KEY (id);


--
-- Name: mensajes mensajes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mensajes
    ADD CONSTRAINT mensajes_pkey PRIMARY KEY (id);


--
-- Name: pagos_cuotas pagos_cuotas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pagos_cuotas
    ADD CONSTRAINT pagos_cuotas_pkey PRIMARY KEY (id);


--
-- Name: persona persona_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.persona
    ADD CONSTRAINT persona_pkey PRIMARY KEY (id);


--
-- Name: recibos_sueldos recibos_sueldos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recibos_sueldos
    ADD CONSTRAINT recibos_sueldos_pkey PRIMARY KEY (id);


--
-- Name: registro_asistencias registro_asistencias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registro_asistencias
    ADD CONSTRAINT registro_asistencias_pkey PRIMARY KEY (id);


--
-- Name: secciones secciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.secciones
    ADD CONSTRAINT secciones_pkey PRIMARY KEY (id);


--
-- Name: solicitudes_admisiones solicitudes_admisiones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitudes_admisiones
    ADD CONSTRAINT solicitudes_admisiones_pkey PRIMARY KEY (id);


--
-- Name: persona ukhlwyecu2r9wagqayhej1kt5wy; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.persona
    ADD CONSTRAINT ukhlwyecu2r9wagqayhej1kt5wy UNIQUE (dni);


--
-- Name: usuarios ukkfsp0s1tflm1cwlj8idhqsad0; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT ukkfsp0s1tflm1cwlj8idhqsad0 UNIQUE (email);


--
-- Name: persona uknefbl9obym4qiqpf6cd4bb2dj; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.persona
    ADD CONSTRAINT uknefbl9obym4qiqpf6cd4bb2dj UNIQUE (usuario_id);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: matriculas fk1angt9j4ys1yw5uq68w9n5c3d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.matriculas
    ADD CONSTRAINT fk1angt9j4ys1yw5uq68w9n5c3d FOREIGN KEY (seccion_id) REFERENCES public.secciones(id);


--
-- Name: informes_trimestrales fk1b0fxrc732rhhbgo7l8u052cx; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.informes_trimestrales
    ADD CONSTRAINT fk1b0fxrc732rhhbgo7l8u052cx FOREIGN KEY (reportado_por_id) REFERENCES public.usuarios(id);


--
-- Name: comunicados fk22r8gvw4ojiksaqegs88j20hn; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comunicados
    ADD CONSTRAINT fk22r8gvw4ojiksaqegs88j20hn FOREIGN KEY (seccion_destino_id) REFERENCES public.secciones(id);


--
-- Name: pagos_cuotas fk2c0xj774n3pa668eq6sqap234; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pagos_cuotas
    ADD CONSTRAINT fk2c0xj774n3pa668eq6sqap234 FOREIGN KEY (cuota_id) REFERENCES public.cuotas(id);


--
-- Name: asignaciones_docentes fk4nvl3eeaud0c85t88kx4f8d7v; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asignaciones_docentes
    ADD CONSTRAINT fk4nvl3eeaud0c85t88kx4f8d7v FOREIGN KEY (personal_id) REFERENCES public.persona(id);


--
-- Name: alumno_familiar fk62sx0tyhtmih7beakaud2m4iv; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alumno_familiar
    ADD CONSTRAINT fk62sx0tyhtmih7beakaud2m4iv FOREIGN KEY (familiar_id) REFERENCES public.persona(id);


--
-- Name: evaluaciones fk68pojmyvkc0rj0w8aaann5ydw; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluaciones
    ADD CONSTRAINT fk68pojmyvkc0rj0w8aaann5ydw FOREIGN KEY (seccion_id) REFERENCES public.secciones(id);


--
-- Name: asistencia_personal fk69vmvyqis3qfv6xxody5n6jsn; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asistencia_personal
    ADD CONSTRAINT fk69vmvyqis3qfv6xxody5n6jsn FOREIGN KEY (personal_id) REFERENCES public.persona(id);


--
-- Name: registro_asistencias fk6aw8ej83y0ilxsgucfsl6pauf; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registro_asistencias
    ADD CONSTRAINT fk6aw8ej83y0ilxsgucfsl6pauf FOREIGN KEY (asistencia_dia_id) REFERENCES public.asistencias_dias(id);


--
-- Name: mensajes fk828al04b97o1tjvlhfhn3eici; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mensajes
    ADD CONSTRAINT fk828al04b97o1tjvlhfhn3eici FOREIGN KEY (receptor_id) REFERENCES public.usuarios(id);


--
-- Name: alumno_familiar fk8gbmr9x6yf9vqgtxxf992j93f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alumno_familiar
    ADD CONSTRAINT fk8gbmr9x6yf9vqgtxxf992j93f FOREIGN KEY (alumno_id) REFERENCES public.persona(id);


--
-- Name: recibos_sueldos fk99dat593ic16pf9dpih75es5t; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recibos_sueldos
    ADD CONSTRAINT fk99dat593ic16pf9dpih75es5t FOREIGN KEY (personal_id) REFERENCES public.persona(id);


--
-- Name: persona fka6nxs99kp9x3uyvl9qcju5dts; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.persona
    ADD CONSTRAINT fka6nxs99kp9x3uyvl9qcju5dts FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- Name: actas_accidente fkcxnv16wdmwir6eqh9n0srwpol; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actas_accidente
    ADD CONSTRAINT fkcxnv16wdmwir6eqh9n0srwpol FOREIGN KEY (alumno_involucrado_id) REFERENCES public.persona(id);


--
-- Name: aspirantes_familiares fkfqdaqv9yrjcb5m4aq5wenvwij; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aspirantes_familiares
    ADD CONSTRAINT fkfqdaqv9yrjcb5m4aq5wenvwij FOREIGN KEY (familiar_id) REFERENCES public.persona(id);


--
-- Name: comunicados fkgr3u6kxplw94pc6un6yothjf; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comunicados
    ADD CONSTRAINT fkgr3u6kxplw94pc6un6yothjf FOREIGN KEY (publicador_id) REFERENCES public.usuarios(id);


--
-- Name: solicitudes_admisiones fkhf40n1aihakv51sc9ux0sify3; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitudes_admisiones
    ADD CONSTRAINT fkhf40n1aihakv51sc9ux0sify3 FOREIGN KEY (aspirante_id) REFERENCES public.persona(id);


--
-- Name: actas_accidente fkhiu4cka2mdj86k5tx3aylnkft; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actas_accidente
    ADD CONSTRAINT fkhiu4cka2mdj86k5tx3aylnkft FOREIGN KEY (matricula_id) REFERENCES public.matriculas(id);


--
-- Name: licencias fkigmxu9l5wrt34861lrpvuslp0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.licencias
    ADD CONSTRAINT fkigmxu9l5wrt34861lrpvuslp0 FOREIGN KEY (personal_id) REFERENCES public.persona(id);


--
-- Name: aspirantes_familiares fkjnjoxqtyd0b6tinly7dmo5dbj; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aspirantes_familiares
    ADD CONSTRAINT fkjnjoxqtyd0b6tinly7dmo5dbj FOREIGN KEY (aspirante_id) REFERENCES public.persona(id);


--
-- Name: cuotas fklc1s8dqfocme47pyk94jqeabx; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuotas
    ADD CONSTRAINT fklc1s8dqfocme47pyk94jqeabx FOREIGN KEY (seccion_id) REFERENCES public.secciones(id);


--
-- Name: mensajes fkmg4oe68p9t40440gdttlg0fny; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mensajes
    ADD CONSTRAINT fkmg4oe68p9t40440gdttlg0fny FOREIGN KEY (emisor_id) REFERENCES public.usuarios(id);


--
-- Name: calificaciones fkn69d245m2l2t398pjjy6us11g; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calificaciones
    ADD CONSTRAINT fkn69d245m2l2t398pjjy6us11g FOREIGN KEY (materia_id) REFERENCES public.materias(id);


--
-- Name: registro_asistencias fknahe7sis39vetbw5h6b3p106i; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registro_asistencias
    ADD CONSTRAINT fknahe7sis39vetbw5h6b3p106i FOREIGN KEY (matricula_id) REFERENCES public.matriculas(id);


--
-- Name: asignaciones_docentes fkon7otxxiyi2hh5fl5459yih94; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asignaciones_docentes
    ADD CONSTRAINT fkon7otxxiyi2hh5fl5459yih94 FOREIGN KEY (seccion_id) REFERENCES public.secciones(id);


--
-- Name: matriculas fkp5vtemhn7bm8yeq8eoixglv2j; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.matriculas
    ADD CONSTRAINT fkp5vtemhn7bm8yeq8eoixglv2j FOREIGN KEY (alumno_id) REFERENCES public.persona(id);


--
-- Name: informes_trimestrales fkp9ajv3jbbglyqv6wd76pda2q0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.informes_trimestrales
    ADD CONSTRAINT fkp9ajv3jbbglyqv6wd76pda2q0 FOREIGN KEY (matricula_id) REFERENCES public.matriculas(id);


--
-- Name: evaluaciones fkp9s5b95benr204hesjg5cetdp; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluaciones
    ADD CONSTRAINT fkp9s5b95benr204hesjg5cetdp FOREIGN KEY (materia_id) REFERENCES public.materias(id);


--
-- Name: calificaciones fkpeeqk6u5nd1p7pluvu0520lpo; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calificaciones
    ADD CONSTRAINT fkpeeqk6u5nd1p7pluvu0520lpo FOREIGN KEY (matricula_id) REFERENCES public.matriculas(id);


--
-- Name: asistencias_dias fkqku37en3nmng3nr5o5398ht1f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asistencias_dias
    ADD CONSTRAINT fkqku37en3nmng3nr5o5398ht1f FOREIGN KEY (seccion_id) REFERENCES public.secciones(id);


--
-- Name: actas_accidente fkr7o75cu5ewue0nmn31gqnvpkf; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actas_accidente
    ADD CONSTRAINT fkr7o75cu5ewue0nmn31gqnvpkf FOREIGN KEY (creado_por_id) REFERENCES public.usuarios(id);


--
-- Name: pagos_cuotas fkrn84asfia4fmvi94u82ffnxvg; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pagos_cuotas
    ADD CONSTRAINT fkrn84asfia4fmvi94u82ffnxvg FOREIGN KEY (matricula_id) REFERENCES public.matriculas(id);


--
-- Name: asignaciones_docentes fkst0q5hu650v1ifujso98lceia; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asignaciones_docentes
    ADD CONSTRAINT fkst0q5hu650v1ifujso98lceia FOREIGN KEY (materia_id) REFERENCES public.materias(id);


--
-- Name: usuario_roles fkuu9tea04xb29m2km5lwe46ua; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario_roles
    ADD CONSTRAINT fkuu9tea04xb29m2km5lwe46ua FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- PostgreSQL database dump complete
--

