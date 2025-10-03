ALTER TABLE bajas_alumnos
    ADD COLUMN IF NOT EXISTS estado_revision_administrativa VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE';

-- Ensure existing rows have a valid value when the column already existed but allowed nulls
UPDATE bajas_alumnos
SET estado_revision_administrativa = 'PENDIENTE'
WHERE estado_revision_administrativa IS NULL;
