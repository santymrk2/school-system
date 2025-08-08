package edu.ecep.base_app.service;

import edu.ecep.base_app.domain.Comunicado;
import edu.ecep.base_app.domain.Seccion;
import edu.ecep.base_app.domain.Usuario;
import edu.ecep.base_app.dtos.ComunicadoDTO;
import edu.ecep.base_app.repos.ComunicadoRepository;
import edu.ecep.base_app.repos.SeccionRepository;
import edu.ecep.base_app.repos.UsuarioRepository;
import edu.ecep.base_app.util.NotFoundException;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;


@Service
public class ComunicadoService {

    private final ComunicadoRepository comunicadoRepository;
    private final SeccionRepository seccionRepository;
    private final UsuarioRepository usuarioRepository;

    public ComunicadoService(final ComunicadoRepository comunicadoRepository,
            final SeccionRepository seccionRepository, final UsuarioRepository usuarioRepository) {
        this.comunicadoRepository = comunicadoRepository;
        this.seccionRepository = seccionRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public List<ComunicadoDTO> findAll() {
        final List<Comunicado> comunicadoes = comunicadoRepository.findAll(Sort.by("id"));
        return comunicadoes.stream()
                .map(comunicado -> mapToDTO(comunicado, new ComunicadoDTO()))
                .toList();
    }

    public ComunicadoDTO get(final Long id) {
        return comunicadoRepository.findById(id)
                .map(comunicado -> mapToDTO(comunicado, new ComunicadoDTO()))
                .orElseThrow(NotFoundException::new);
    }

    public Long create(final ComunicadoDTO comunicadoDTO) {
        final Comunicado comunicado = new Comunicado();
        mapToEntity(comunicadoDTO, comunicado);
        return comunicadoRepository.save(comunicado).getId();
    }

    public void update(final Long id, final ComunicadoDTO comunicadoDTO) {
        final Comunicado comunicado = comunicadoRepository.findById(id)
                .orElseThrow(NotFoundException::new);
        mapToEntity(comunicadoDTO, comunicado);
        comunicadoRepository.save(comunicado);
    }

    public void delete(final Long id) {
        comunicadoRepository.deleteById(id);
    }

    private ComunicadoDTO mapToDTO(final Comunicado comunicado, final ComunicadoDTO comunicadoDTO) {
        comunicadoDTO.setId(comunicado.getId());
        comunicadoDTO.setTitulo(comunicado.getTitulo());
        comunicadoDTO.setCuerpoMensaje(comunicado.getCuerpoMensaje());
        comunicadoDTO.setTipoComunicacion(comunicado.getTipoComunicacion());
        comunicadoDTO.setNivelDestino(comunicado.getNivelDestino());
        comunicadoDTO.setSeccionDestino(comunicado.getSeccionDestino() == null ? null : comunicado.getSeccionDestino().getId());
        comunicadoDTO.setPublicador(comunicado.getPublicador() == null ? null : comunicado.getPublicador().getId());
        return comunicadoDTO;
    }

    private Comunicado mapToEntity(final ComunicadoDTO comunicadoDTO, final Comunicado comunicado) {
        comunicado.setTitulo(comunicadoDTO.getTitulo());
        comunicado.setCuerpoMensaje(comunicadoDTO.getCuerpoMensaje());
        comunicado.setTipoComunicacion(comunicadoDTO.getTipoComunicacion());
        comunicado.setNivelDestino(comunicadoDTO.getNivelDestino());
        final Seccion seccionDestino = comunicadoDTO.getSeccionDestino() == null ? null : seccionRepository.findById(comunicadoDTO.getSeccionDestino())
                .orElseThrow(() -> new NotFoundException("seccionDestino not found"));
        comunicado.setSeccionDestino(seccionDestino);
        final Usuario publicador = comunicadoDTO.getPublicador() == null ? null : usuarioRepository.findById(comunicadoDTO.getPublicador())
                .orElseThrow(() -> new NotFoundException("publicador not found"));
        comunicado.setPublicador(publicador);
        return comunicado;
    }

}
