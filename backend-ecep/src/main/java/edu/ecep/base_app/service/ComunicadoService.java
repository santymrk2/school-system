package edu.ecep.base_app.service;

import edu.ecep.base_app.domain.Comunicado;
import edu.ecep.base_app.domain.Seccion;
import edu.ecep.base_app.domain.Usuario;
import edu.ecep.base_app.domain.enums.AlcanceComunicado;
import edu.ecep.base_app.dtos.ComunicadoCreateDTO;
import edu.ecep.base_app.dtos.ComunicadoDTO;
import edu.ecep.base_app.mappers.ComunicadoMapper;
import edu.ecep.base_app.repos.ComunicadoRepository;
import edu.ecep.base_app.repos.SeccionRepository;
import edu.ecep.base_app.repos.UsuarioRepository;
import edu.ecep.base_app.util.NotFoundException;
import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;


@Service @RequiredArgsConstructor
public class ComunicadoService {
    private final ComunicadoRepository repo; private final ComunicadoMapper mapper;
    public List<ComunicadoDTO> findAll(){ return repo.findAll(Sort.by("id")).stream().map(mapper::toDto).toList(); }
    public Long create(ComunicadoCreateDTO dto){
        // Validaciones condicionales por alcance
        if(dto.getAlcance()==AlcanceComunicado.POR_SECCION && dto.getSeccionId()==null) throw new IllegalArgumentException("Sección requerida");
        if(dto.getAlcance()== AlcanceComunicado.POR_NIVEL && dto.getNivel()==null) throw new IllegalArgumentException("Nivel requerido");
        return repo.save(mapper.toEntity(dto)).getId();
    }
}
