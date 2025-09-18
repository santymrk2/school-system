package edu.ecep.base_app.service;

import edu.ecep.base_app.domain.Cuota;
import edu.ecep.base_app.domain.Matricula;
import edu.ecep.base_app.domain.MatriculaSeccionHistorial;
import edu.ecep.base_app.domain.enums.ConceptoCuota;
import edu.ecep.base_app.dtos.CuotaBulkCreateDTO;
import edu.ecep.base_app.dtos.CuotaCreateDTO;
import edu.ecep.base_app.dtos.CuotaDTO;
import edu.ecep.base_app.mappers.CuotaMapper;
import edu.ecep.base_app.repos.CuotaRepository;
import edu.ecep.base_app.repos.MatriculaRepository;
import edu.ecep.base_app.repos.MatriculaSeccionHistorialRepository;
import edu.ecep.base_app.util.NotFoundException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CuotaService {
    private final CuotaRepository repo;
    private final CuotaMapper mapper;
    private final MatriculaSeccionHistorialRepository historialRepository;
    private final MatriculaRepository matriculaRepository;

    public List<CuotaDTO> findAll(){
        return repo.findAll(Sort.by("anio","mes"))
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    public CuotaDTO get(Long id){
        return repo.findById(id)
                .map(mapper::toDto)
                .orElseThrow(NotFoundException::new);
    }

    public Long create(CuotaCreateDTO dto){
        if(dto.getConcepto()== ConceptoCuota.MENSUALIDAD && repo.existsByMatriculaIdAndAnioAndMesAndConcepto(dto.getMatriculaId(), dto.getAnio(), dto.getMes(), dto.getConcepto()))
            throw new IllegalArgumentException("Mensualidad duplicada");
        if(dto.getConcepto()==ConceptoCuota.MATRICULA && repo.existsByMatriculaIdAndAnioAndConcepto(dto.getMatriculaId(), dto.getAnio(), dto.getConcepto()))
            throw new IllegalArgumentException("Matrícula duplicada");
        return repo.save(mapper.toEntity(dto)).getId();
    }

    @Transactional
    public List<Long> bulkCreate(CuotaBulkCreateDTO dto) {
        if(dto.getSeccionIds()==null || dto.getSeccionIds().isEmpty()) return List.of();

        ConceptoCuota concepto = dto.isMatricula() ? ConceptoCuota.MATRICULA : dto.getConcepto();
        if(concepto == null) concepto = ConceptoCuota.MENSUALIDAD;

        LocalDate fechaVencimiento = dto.getFechaVencimiento();
        if(fechaVencimiento == null)
            throw new IllegalArgumentException("La fecha de vencimiento es obligatoria");

        int anio = dto.getAnio() != null ? dto.getAnio() : fechaVencimiento.getYear();
        Integer mes = dto.getMes();
        if(concepto == ConceptoCuota.MENSUALIDAD) {
            if(mes == null) mes = fechaVencimiento.getMonthValue();
        } else {
            mes = null;
        }

        BigDecimal recargo = dto.getPorcentajeRecargo() != null ? dto.getPorcentajeRecargo() : BigDecimal.ZERO;

        LocalDate fechaReferencia = fechaVencimiento;
        Set<Long> matriculaIds = new HashSet<>();
        for(Long seccionId : dto.getSeccionIds()){
            List<MatriculaSeccionHistorial> activos = historialRepository.findActivosBySeccionOnDate(seccionId, fechaReferencia);
            for(MatriculaSeccionHistorial historial : activos){
                Matricula matricula = historial.getMatricula();
                if(matricula != null && matricula.getId() != null)
                    matriculaIds.add(matricula.getId());
            }
        }

        if(matriculaIds.isEmpty()) return List.of();

        List<Long> created = new ArrayList<>();
        for(Long matriculaId : matriculaIds){
            if(concepto == ConceptoCuota.MENSUALIDAD && repo.existsByMatriculaIdAndAnioAndMesAndConcepto(matriculaId, anio, mes, concepto))
                continue;
            if(concepto == ConceptoCuota.MATRICULA && repo.existsByMatriculaIdAndAnioAndConcepto(matriculaId, anio, concepto))
                continue;

            Cuota cuota = new Cuota();
            cuota.setMatricula(matriculaRepository.getReferenceById(matriculaId));
            cuota.setConcepto(concepto);
            cuota.setSubconcepto(dto.getSubconcepto());
            cuota.setAnio(anio);
            cuota.setMes(mes);
            cuota.setImporte(dto.getImporte());
            cuota.setFechaVencimiento(fechaVencimiento);
            cuota.setPorcentajeRecargo(recargo);
            cuota.setCodigoPago(generarCodigo(concepto, anio, mes, matriculaId));
            cuota.setObservaciones(dto.getObservaciones());

            Cuota saved = repo.save(cuota);
            created.add(saved.getId());
        }

        return created;
    }

    private String generarCodigo(ConceptoCuota concepto, int anio, Integer mes, Long matriculaId){
        String prefix;
        switch (concepto) {
            case MATRICULA -> prefix = "MAT";
            case MENSUALIDAD -> prefix = "MENS";
            case MATERIALES -> prefix = "MATE";
            case OTROS -> prefix = "OTRO";
            default -> prefix = "CUO";
        }

        String periodo = mes != null ? String.format("%04d%02d", anio, mes) : String.format("%04d", anio);
        String base = String.format("%s-%s-%05d", prefix, periodo, matriculaId);
        String candidate = base;
        int suffix = 1;
        while (repo.existsByCodigoPago(candidate)) {
            candidate = base + "-" + suffix;
            suffix++;
        }
        return candidate;
    }

    public void update(Long id, CuotaDTO dto){
        var entity = repo.findById(id).orElseThrow(NotFoundException::new);
        mapper.update(entity, dto);
        repo.save(entity);
    }

    public void delete(Long id){
        if(!repo.existsById(id)) throw new NotFoundException();
        repo.deleteById(id);
    }
}
