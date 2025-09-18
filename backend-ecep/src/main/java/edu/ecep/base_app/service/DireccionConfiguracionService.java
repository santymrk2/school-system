package edu.ecep.base_app.service;

import edu.ecep.base_app.domain.PeriodoEscolar;
import edu.ecep.base_app.dtos.DireccionConfiguracionDTO;
import edu.ecep.base_app.dtos.PeriodoEscolarDTO;
import edu.ecep.base_app.dtos.TrimestreDTO;
import edu.ecep.base_app.mappers.PeriodoEscolarMapper;
import edu.ecep.base_app.repos.PeriodoEscolarRepository;
import edu.ecep.base_app.util.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DireccionConfiguracionService {

    private final PeriodoEscolarRepository periodoRepo;
    private final PeriodoEscolarMapper periodoMapper;
    private final TrimestreService trimestreService;

    public DireccionConfiguracionDTO obtenerConfiguracionActual() {
        return periodoRepo.findFirstByActivoTrueAndCerradoFalseOrderByAnioDesc()
                .map(this::mapearConfiguracion)
                .orElseGet(() -> new DireccionConfiguracionDTO(null, List.of()));
    }

    public DireccionConfiguracionDTO obtenerConfiguracionPorPeriodo(Long periodoId) {
        PeriodoEscolar periodo = periodoRepo.findById(periodoId)
                .orElseThrow(() -> new NotFoundException("Periodo escolar no encontrado"));
        return mapearConfiguracion(periodo);
    }

    private DireccionConfiguracionDTO mapearConfiguracion(PeriodoEscolar periodo) {
        PeriodoEscolarDTO periodoDTO = periodoMapper.toDto(periodo);
        List<TrimestreDTO> trimestres = trimestreService.listByPeriodo(periodo.getId());
        return new DireccionConfiguracionDTO(periodoDTO, trimestres);
    }
}
