package edu.ecep.base_app.gestionacademica.application;

import edu.ecep.base_app.gestionacademica.domain.Trimestre;
import edu.ecep.base_app.gestionacademica.domain.TrimestreEstado;
import edu.ecep.base_app.gestionacademica.presentation.dto.TrimestreCreateDTO;
import edu.ecep.base_app.gestionacademica.presentation.dto.TrimestreDTO;
import edu.ecep.base_app.gestionacademica.infrastructure.mapper.TrimestreMapper;
import edu.ecep.base_app.gestionacademica.infrastructure.persistence.TrimestreRepository;
import edu.ecep.base_app.shared.exception.NotFoundException;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional
public class TrimestreService {

    private final TrimestreRepository repo;
    private final TrimestreMapper mapper;

    @Transactional(readOnly = true)
    public List<TrimestreDTO> list() {
        Sort sort = Sort.by(
                Sort.Order.asc("periodoEscolar.anio"),
                Sort.Order.asc("orden"),
                Sort.Order.asc("inicio")
        );
        return repo.findAll(sort).stream().map(mapper::toDto).toList();
    }

    @Transactional(readOnly = true)
    public TrimestreDTO get(Long id) {
        Trimestre t = repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Trimestre " + id + " no encontrado"));
        return mapper.toDto(t);
    }

    public Long create(TrimestreCreateDTO dto) {
        validateFechas(dto.getPeriodoEscolarId(), dto.getOrden(), dto.getInicio(), dto.getFin(), null);
        Trimestre e = mapper.toEntity(dto);
        e.setEstado(TrimestreEstado.INACTIVO);
        return repo.save(e).getId();
    }

    public void update(Long id, TrimestreDTO dto) {
        Trimestre t = repo.findById(id)
                .orElseThrow(() -> new NotFoundException("Trimestre no encontrado"));

        Long periodoIdActual = t.getPeriodoEscolar() != null ? t.getPeriodoEscolar().getId() : null;
        if (periodoIdActual != null && dto.getPeriodoEscolarId() != null
                && !Objects.equals(dto.getPeriodoEscolarId(), periodoIdActual)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "No es posible mover un trimestre a otro período escolar");
        }

        Long periodoParaValidar = periodoIdActual != null ? periodoIdActual : dto.getPeriodoEscolarId();
        validateFechas(periodoParaValidar, dto.getOrden(), dto.getInicio(), dto.getFin(), t.getId());

        mapper.updateEntityFromDto(dto, t);
        repo.save(t);
    }

    public void cerrar(Long id) {
        Trimestre e = repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Trimestre " + id + " no encontrado"));
        if (e.getEstado() == TrimestreEstado.CERRADO) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El trimestre ya está cerrado");
        }
        if (e.getEstado() != TrimestreEstado.ACTIVO) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Solo se puede cerrar un trimestre activo");
        }
        e.setEstado(TrimestreEstado.CERRADO);
        repo.save(e);
    }

    public void reabrir(Long id) {
        Trimestre e = repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Trimestre " + id + " no encontrado"));
        if (e.getEstado() == TrimestreEstado.ACTIVO) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El trimestre ya está activo");
        }

        Long periodoId = e.getPeriodoEscolar() != null ? e.getPeriodoEscolar().getId() : null;
        if (periodoId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "El trimestre no tiene un período escolar asociado");
        }
        List<Trimestre> delPeriodo = repo.findByPeriodoEscolarIdOrderByOrdenAsc(periodoId);

        boolean otroAbierto = delPeriodo.stream()
                .anyMatch(t -> !Objects.equals(t.getId(), e.getId()) && t.getEstado() == TrimestreEstado.ACTIVO);
        if (otroAbierto) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cerrá el trimestre activo antes de abrir otro");
        }

        boolean anterioresCerrados = delPeriodo.stream()
                .filter(t -> !Objects.equals(t.getId(), e.getId())
                        && t.getOrden() != null
                        && e.getOrden() != null
                        && t.getOrden() < e.getOrden())
                .allMatch(t -> t.getEstado() == TrimestreEstado.CERRADO);
        if (!anterioresCerrados) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Debés cerrar los trimestres anteriores antes de abrir este");
        }

        e.setEstado(TrimestreEstado.ACTIVO);
        repo.save(e);
    }

    private void validateFechas(Long periodoId, Integer orden, LocalDate inicio, LocalDate fin, Long selfId) {
        if (periodoId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Debe indicar el período escolar");
        }
        if (orden == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Debe indicar el orden del trimestre");
        }
        if (orden < 1 || orden > 3) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "El orden del trimestre debe estar entre 1 y 3");
        }
        if (inicio == null || fin == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Debe completar las fechas de inicio y fin del trimestre");
        }
        if (inicio.isAfter(fin)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La fecha de inicio no puede ser posterior a la de fin");
        }

        List<Trimestre> existentes = repo.findByPeriodoEscolarIdOrderByOrdenAsc(periodoId);
        if (selfId == null && existentes.size() >= 3) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "El período ya tiene configurados tres trimestres");
        }

        for (Trimestre otro : existentes) {
            if (Objects.equals(otro.getId(), selfId)) {
                continue;
            }
            if (Objects.equals(otro.getOrden(), orden)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Ya existe un trimestre con ese orden para el período seleccionado");
            }
        }

        if (orden > 1) {
            boolean existeAnterior = existentes.stream()
                    .filter(t -> !Objects.equals(t.getId(), selfId))
                    .anyMatch(t -> t.getOrden() != null && t.getOrden() == orden - 1);
            if (!existeAnterior) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Debés configurar primero el trimestre inmediato anterior");
            }
        }

        Trimestre anterior = existentes.stream()
                .filter(t -> !Objects.equals(t.getId(), selfId)
                        && t.getOrden() != null
                        && t.getOrden() < orden)
                .max(Comparator.comparingInt(t -> t.getOrden() == null ? 0 : t.getOrden()))
                .orElse(null);
        if (anterior != null && anterior.getFin() != null && anterior.getFin().isAfter(inicio)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La fecha de inicio debe ser posterior o igual al fin del trimestre anterior");
        }

        Trimestre siguiente = existentes.stream()
                .filter(t -> !Objects.equals(t.getId(), selfId)
                        && t.getOrden() != null
                        && t.getOrden() > orden)
                .min(Comparator.comparingInt(t -> t.getOrden() == null ? Integer.MAX_VALUE : t.getOrden()))
                .orElse(null);
        if (siguiente != null && siguiente.getInicio() != null && siguiente.getInicio().isBefore(fin)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La fecha de fin debe ser anterior o igual al inicio del trimestre siguiente");
        }
    }
}
