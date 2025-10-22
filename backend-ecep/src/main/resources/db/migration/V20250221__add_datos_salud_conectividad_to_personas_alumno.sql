ALTER TABLE personas_alumno
    ADD COLUMN conectividad_internet VARCHAR(255),
    ADD COLUMN dispositivos_disponibles VARCHAR(255),
    ADD COLUMN idiomas_hablados_hogar VARCHAR(255),
    ADD COLUMN enfermedades_alergias TEXT,
    ADD COLUMN medicacion_habitual TEXT,
    ADD COLUMN limitaciones_fisicas TEXT,
    ADD COLUMN tratamientos_terapeuticos TEXT,
    ADD COLUMN uso_ayudas_movilidad BOOLEAN,
    ADD COLUMN cobertura_medica VARCHAR(255),
    ADD COLUMN observaciones_salud TEXT;
