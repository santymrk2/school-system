package edu.ecep.base_app.admisiones.application;

import edu.ecep.base_app.admisiones.domain.Aspirante;
import edu.ecep.base_app.identidad.domain.Persona;
import edu.ecep.base_app.admisiones.presentation.dto.AspiranteDTO;
import edu.ecep.base_app.admisiones.infrastructure.mapper.AspiranteMapper;
import edu.ecep.base_app.admisiones.infrastructure.persistence.AspiranteFamiliarRepository;
import edu.ecep.base_app.admisiones.infrastructure.persistence.AspiranteRepository;
import edu.ecep.base_app.identidad.infrastructure.persistence.PersonaRepository;
import edu.ecep.base_app.admisiones.infrastructure.persistence.SolicitudAdmisionRepository;
import edu.ecep.base_app.shared.exception.NotFoundException;
import edu.ecep.base_app.shared.exception.ReferencedException;
import edu.ecep.base_app.shared.exception.ReferencedWarning;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AspiranteService {

    private final AspiranteRepository aspiranteRepository;
    private final PersonaRepository personaRepository;
    private final SolicitudAdmisionRepository solicitudAdmisionRepository;
    private final AspiranteFamiliarRepository aspiranteFamiliarRepository;
    private final AspiranteMapper mapper;

    public List<AspiranteDTO> findAll() {
        return aspiranteRepository.findAll(Sort.by("id"))
                .stream().map(mapper::toDto).toList();
    }

    public AspiranteDTO get(Long id) {
        return aspiranteRepository.findById(id)
                .map(mapper::toDto)
                .orElseThrow(() -> new NotFoundException("Aspirante no encontrado"));
    }

    public Optional<AspiranteDTO> findByPersonaId(Long personaId) {
        if (personaId == null) {
            return Optional.empty();
        }
        return aspiranteRepository.findByPersonaId(personaId)
                .map(mapper::toDto);
    }

    @Transactional
    public AspiranteDTO create(AspiranteDTO dto) {
        // 1) Validar personaId
        Long personaId = dto.getPersonaId();
        if (personaId == null) {
            throw new IllegalArgumentException("personaId es obligatorio para crear un aspirante");
        }

        // 2) Buscar Persona
        Persona persona = personaRepository.findById(personaId)
                .orElseThrow(() -> new NotFoundException("Persona no encontrada"));

        // 3) Evitar duplicados (una misma persona no puede ser Aspirante dos veces)
        if (aspiranteRepository.existsByPersonaId(personaId)) {
            throw new IllegalArgumentException("La persona ya tiene rol Aspirante");
        }

        // 4) Crear Aspirante
        Aspirante a = new Aspirante();
        a.setPersona(persona);
        // copiar campos propios desde el dto (alta)
        copyPropsForCreate(a, dto);

        a = aspiranteRepository.save(a);
        return mapper.toDto(a);
    }

    @Transactional
    public AspiranteDTO update(Long id, AspiranteDTO dto) {
        Aspirante a = aspiranteRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Aspirante no encontrado"));

        // Con @MapsId NO permitimos cambiar la persona (cambia la PK).
        if (dto.getPersonaId() != null) {
            Long currentPersonaId = (a.getPersona() != null) ? a.getPersona().getId() : null;
            if (!dto.getPersonaId().equals(currentPersonaId)) {
                throw new IllegalArgumentException(
                        "No se puede cambiar la persona de un Aspirante. " +
                                "Elimine el registro y cree uno nuevo con el personaId correcto."
                );
            }
            // si es igual, seguimos (idempotente)
        }

        // patch de campos propios (solo no nulos)
        applyPatch(a, dto);
        // save no es necesario explícitamente (Hibernate flush con @Transactional),
        // pero lo dejamos si preferís retorno inmediato
        a = aspiranteRepository.save(a);

        return mapper.toDto(a);
    }

    @Transactional
    public void delete(Long id) {
        ReferencedWarning warning = getReferencedWarning(id);
        if (warning != null) throw new ReferencedException(warning);
        if (!aspiranteRepository.existsById(id)) {
            throw new NotFoundException("Aspirante no encontrado: " + id);
        }
        aspiranteRepository.deleteById(id);
    }

    public ReferencedWarning getReferencedWarning(Long id) {
        if (solicitudAdmisionRepository.existsByAspiranteId(id)) {
            ReferencedWarning w = new ReferencedWarning("aspirante.referenciado.solicitudes");
            w.addParam(id);
            return w;
        }
        if (aspiranteFamiliarRepository.existsByAspiranteId(id)) {
            ReferencedWarning w = new ReferencedWarning("aspirante.referenciado.familiares");
            w.addParam(id);
            return w;
        }
        return null;
    }

    /** Copia campos propios para el alta (puede aceptar nulls). */
    private void copyPropsForCreate(Aspirante a, AspiranteDTO dto) {
        a.setCursoSolicitado(dto.getCursoSolicitado());
        a.setTurnoPreferido(dto.getTurnoPreferido());
        a.setEscuelaActual(dto.getEscuelaActual());
        a.setConectividadInternet(dto.getConectividadInternet());
        a.setDispositivosDisponibles(dto.getDispositivosDisponibles());
        a.setIdiomasHabladosHogar(dto.getIdiomasHabladosHogar());
        a.setEnfermedadesAlergias(dto.getEnfermedadesAlergias());
        a.setMedicacionHabitual(dto.getMedicacionHabitual());
        a.setLimitacionesFisicas(dto.getLimitacionesFisicas());
        a.setTratamientosTerapeuticos(dto.getTratamientosTerapeuticos());
        a.setUsoAyudasMovilidad(dto.getUsoAyudasMovilidad());
        a.setCoberturaMedica(dto.getCoberturaMedica());
        a.setObservacionesSalud(dto.getObservacionesSalud());
    }

    /** Aplica patch: sólo pisa si el campo del dto NO es null. */
    private void applyPatch(Aspirante a, AspiranteDTO dto) {
        if (dto.getCursoSolicitado() != null)          a.setCursoSolicitado(dto.getCursoSolicitado());
        if (dto.getTurnoPreferido() != null)           a.setTurnoPreferido(dto.getTurnoPreferido());
        if (dto.getEscuelaActual() != null)            a.setEscuelaActual(dto.getEscuelaActual());
        if (dto.getConectividadInternet() != null)     a.setConectividadInternet(dto.getConectividadInternet());
        if (dto.getDispositivosDisponibles() != null)  a.setDispositivosDisponibles(dto.getDispositivosDisponibles());
        if (dto.getIdiomasHabladosHogar() != null)     a.setIdiomasHabladosHogar(dto.getIdiomasHabladosHogar());
        if (dto.getEnfermedadesAlergias() != null)     a.setEnfermedadesAlergias(dto.getEnfermedadesAlergias());
        if (dto.getMedicacionHabitual() != null)       a.setMedicacionHabitual(dto.getMedicacionHabitual());
        if (dto.getLimitacionesFisicas() != null)      a.setLimitacionesFisicas(dto.getLimitacionesFisicas());
        if (dto.getTratamientosTerapeuticos() != null) a.setTratamientosTerapeuticos(dto.getTratamientosTerapeuticos());
        if (dto.getUsoAyudasMovilidad() != null)       a.setUsoAyudasMovilidad(dto.getUsoAyudasMovilidad());
        if (dto.getCoberturaMedica() != null)          a.setCoberturaMedica(dto.getCoberturaMedica());
        if (dto.getObservacionesSalud() != null)       a.setObservacionesSalud(dto.getObservacionesSalud());
    }
}