package edu.ecep.base_app.vidaescolar.application;

import edu.ecep.base_app.vidaescolar.domain.MatriculaSeccionHistorial;
import edu.ecep.base_app.vidaescolar.presentation.dto.MatriculaSeccionHistorialCreateDTO;
import edu.ecep.base_app.vidaescolar.presentation.dto.MatriculaSeccionHistorialDTO;
import edu.ecep.base_app.vidaescolar.infrastructure.mapper.MatriculaSeccionHistorialMapper;
import edu.ecep.base_app.vidaescolar.infrastructure.persistence.MatriculaSeccionHistorialRepository;
import edu.ecep.base_app.shared.exception.NotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MatriculaSeccionHistorialService {

    private final MatriculaSeccionHistorialRepository repo;
    private final MatriculaSeccionHistorialMapper mapper;

    public List<MatriculaSeccionHistorialDTO> findAll() {
        return repo.findAll(Sort.by("matricula.id", "desde").descending())
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    @Transactional
    public Long asignar(MatriculaSeccionHistorialCreateDTO dto) {
        if (dto.getHasta() != null && dto.getHasta().isBefore(dto.getDesde())) {
            throw new IllegalArgumentException("Rango inválido");
        }
        cerrarHistorialesVigentes(dto.getMatriculaId(), dto.getDesde());
        // NOTA: acá podrías validar solapamientos con una consulta adicional
        return repo.save(mapper.toEntity(dto)).getId();
    }

    @Transactional
    public void update(Long id, MatriculaSeccionHistorialDTO dto) {
        var entity = repo.findById(id)
                .orElseThrow(() -> new NotFoundException("Historial de sección no encontrado"));

        mapper.update(entity, dto);

        if (entity.getHasta() != null && entity.getDesde() != null
                && entity.getHasta().isBefore(entity.getDesde())) {
            throw new IllegalArgumentException("Rango inválido");
        }

        repo.save(entity);
    }

    private void cerrarHistorialesVigentes(Long matriculaId, LocalDate nuevaDesde) {
        if (matriculaId == null || nuevaDesde == null) {
            return;
        }
        List<MatriculaSeccionHistorial> vigentes = repo.findVigente(matriculaId, nuevaDesde);
        for (MatriculaSeccionHistorial vigente : vigentes) {
            if (vigente.getHasta() != null && vigente.getHasta().isBefore(nuevaDesde)) {
                continue;
            }

            LocalDate nuevoHasta = nuevaDesde.minusDays(1);
            if (nuevoHasta.isBefore(vigente.getDesde())) {
                // La nueva asignación comienza el mismo día (o antes) que la anterior.
                // No tiene sentido conservar el registro previo porque nunca quedó vigente,
                // así que lo damos de baja lógica para evitar solapamientos.
                repo.delete(vigente);
                continue;
            }

            vigente.setHasta(nuevoHasta);
            repo.save(vigente);
        }
    }
}
