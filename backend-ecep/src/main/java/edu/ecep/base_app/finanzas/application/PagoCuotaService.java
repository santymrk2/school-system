package edu.ecep.base_app.finanzas.application;

import edu.ecep.base_app.finanzas.domain.Cuota;
import edu.ecep.base_app.finanzas.domain.PagoCuota;
import edu.ecep.base_app.finanzas.presentation.dto.PagoCuotaCreateDTO;
import edu.ecep.base_app.finanzas.presentation.dto.PagoCuotaDTO;
import edu.ecep.base_app.finanzas.presentation.dto.PagoCuotaEstadoUpdateDTO;
import edu.ecep.base_app.finanzas.infrastructure.mapper.PagoCuotaMapper;
import edu.ecep.base_app.finanzas.infrastructure.persistence.CuotaRepository;
import edu.ecep.base_app.finanzas.infrastructure.persistence.PagoCuotaRepository;
import edu.ecep.base_app.shared.exception.NotFoundException;
import java.util.List;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;


@Service @RequiredArgsConstructor
public class PagoCuotaService {
    private final PagoCuotaRepository repo; private final PagoCuotaMapper mapper; private final CuotaRepository cuotaRepo;
    public List<PagoCuotaDTO> findAll(){ return repo.findAll(Sort.by("id")).stream().map(mapper::toDto).toList(); }
    public PagoCuotaDTO get(Long id){
        return repo.findById(id).map(mapper::toDto).orElseThrow(() -> new NotFoundException("No encontrado"));
    }
    public Long crearPago(PagoCuotaCreateDTO dto){
        // ejemplo de validación simple: código de pago existente
        Cuota c = cuotaRepo.findById(dto.getCuotaId()).orElseThrow(() -> new NotFoundException("No encontrado"));
        return repo.save(mapper.toEntity(dto)).getId();
    }
    @Transactional
    public void actualizarEstado(Long id, PagoCuotaEstadoUpdateDTO dto){
        PagoCuota p = repo.findById(id).orElseThrow(() -> new NotFoundException("No encontrado"));
        mapper.updateEstado(p, dto);
    }

    public void delete(Long id){
        if(!repo.existsById(id)) throw new NotFoundException("No encontrado");
        repo.deleteById(id);
    }
}
