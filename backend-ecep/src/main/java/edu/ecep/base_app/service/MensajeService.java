package edu.ecep.base_app.service;

import edu.ecep.base_app.domain.Mensaje;
import edu.ecep.base_app.domain.Usuario;
import edu.ecep.base_app.dtos.MensajeDTO;
import edu.ecep.base_app.repos.MensajeRepository;
import edu.ecep.base_app.repos.UsuarioRepository;
import edu.ecep.base_app.util.NotFoundException;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;


@Service
public class MensajeService {

    private final MensajeRepository mensajeRepository;
    private final UsuarioRepository usuarioRepository;

    public MensajeService(final MensajeRepository mensajeRepository,
            final UsuarioRepository usuarioRepository) {
        this.mensajeRepository = mensajeRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public List<MensajeDTO> findAll() {
        final List<Mensaje> mensajes = mensajeRepository.findAll(Sort.by("id"));
        return mensajes.stream()
                .map(mensaje -> mapToDTO(mensaje, new MensajeDTO()))
                .toList();
    }

    public MensajeDTO get(final Long id) {
        return mensajeRepository.findById(id)
                .map(mensaje -> mapToDTO(mensaje, new MensajeDTO()))
                .orElseThrow(NotFoundException::new);
    }

    public Long create(final MensajeDTO mensajeDTO) {
        final Mensaje mensaje = new Mensaje();
        mapToEntity(mensajeDTO, mensaje);
        return mensajeRepository.save(mensaje).getId();
    }

    public void update(final Long id, final MensajeDTO mensajeDTO) {
        final Mensaje mensaje = mensajeRepository.findById(id)
                .orElseThrow(NotFoundException::new);
        mapToEntity(mensajeDTO, mensaje);
        mensajeRepository.save(mensaje);
    }

    public void delete(final Long id) {
        mensajeRepository.deleteById(id);
    }

    private MensajeDTO mapToDTO(final Mensaje mensaje, final MensajeDTO mensajeDTO) {
        mensajeDTO.setId(mensaje.getId());
        mensajeDTO.setFechaEnvio(mensaje.getFechaEnvio());
        mensajeDTO.setAsunto(mensaje.getAsunto());
        mensajeDTO.setContenido(mensaje.getContenido());
        mensajeDTO.setLeido(mensaje.getLeido());
        mensajeDTO.setEmisor(mensaje.getEmisor() == null ? null : mensaje.getEmisor().getId());
        mensajeDTO.setReceptor(mensaje.getReceptor() == null ? null : mensaje.getReceptor().getId());
        return mensajeDTO;
    }

    private Mensaje mapToEntity(final MensajeDTO mensajeDTO, final Mensaje mensaje) {
        mensaje.setFechaEnvio(mensajeDTO.getFechaEnvio());
        mensaje.setAsunto(mensajeDTO.getAsunto());
        mensaje.setContenido(mensajeDTO.getContenido());
        mensaje.setLeido(mensajeDTO.getLeido());
        final Usuario emisor = mensajeDTO.getEmisor() == null ? null : usuarioRepository.findById(mensajeDTO.getEmisor())
                .orElseThrow(() -> new NotFoundException("emisor not found"));
        mensaje.setEmisor(emisor);
        final Usuario receptor = mensajeDTO.getReceptor() == null ? null : usuarioRepository.findById(mensajeDTO.getReceptor())
                .orElseThrow(() -> new NotFoundException("receptor not found"));
        mensaje.setReceptor(receptor);
        return mensaje;
    }

}
