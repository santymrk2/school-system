package edu.ecep.base_app.service;

import edu.ecep.base_app.domain.Cuota;
import edu.ecep.base_app.domain.PagoCuota;
import edu.ecep.base_app.dtos.PagoCuotaCreateDTO;
import edu.ecep.base_app.dtos.PagoCuotaDTO;
import edu.ecep.base_app.dtos.PagoCuotaEstadoUpdateDTO;
import edu.ecep.base_app.mappers.PagoCuotaMapper;
import edu.ecep.base_app.repos.*;
import edu.ecep.base_app.util.NotFoundException;
import java.util.List;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;


@Service @RequiredArgsConstructor
public class PagoCuotaService {
    private final PagoCuotaRepository repo; private final PagoCuotaMapper mapper; private final CuotaRepository cuotaRepo;
    public List<PagoCuotaDTO> findAll(){ return repo.findAll(Sort.by("id")).stream().map(mapper::toDto).toList(); }
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
}