ALTER TABLE personas_empleado
    ADD COLUMN IF NOT EXISTS legajo VARCHAR(20);

CREATE UNIQUE INDEX IF NOT EXISTS ux_personas_empleado_legajo
    ON personas_empleado (legajo)
    WHERE legajo IS NOT NULL;
