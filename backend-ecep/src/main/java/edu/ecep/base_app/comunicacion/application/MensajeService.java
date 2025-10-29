package edu.ecep.base_app.comunicacion.application;

import edu.ecep.base_app.comunicacion.domain.Mensaje;
import edu.ecep.base_app.comunicacion.infrastructure.persistence.MensajeRepository;
import edu.ecep.base_app.comunicacion.presentation.dto.MensajeDTO;
import edu.ecep.base_app.identidad.infrastructure.persistence.PersonaRepository;
import edu.ecep.base_app.shared.exception.NotFoundException;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MensajeService {

    private final MensajeRepository mensajeRepository;
    private final PersonaRepository personaRepository;

    public MensajeService(final MensajeRepository mensajeRepository,
                          final PersonaRepository personaRepository) {
        this.mensajeRepository = mensajeRepository;
        this.personaRepository = personaRepository;
    }

    public List<MensajeDTO> findAll() {
        final List<Mensaje> mensajes = mensajeRepository.findAll(Sort.by(Sort.Direction.ASC, "fechaEnvio"));
        return mensajes.stream()
                .map(mensaje -> mapToDTO(mensaje, new MensajeDTO()))
                .toList();
    }

    public MensajeDTO get(final String id) {
        return mensajeRepository.findById(id)
                .map(mensaje -> mapToDTO(mensaje, new MensajeDTO()))
                .orElseThrow(NotFoundException::new);
    }

    public String create(final MensajeDTO mensajeDTO) {
        final Mensaje mensaje = new Mensaje();
        mapToEntity(mensajeDTO, mensaje);
        return mensajeRepository.save(mensaje).getId();
    }

    public void update(final String id, final MensajeDTO mensajeDTO) {
        final Mensaje mensaje = mensajeRepository.findById(id)
                .orElseThrow(NotFoundException::new);
        mapToEntity(mensajeDTO, mensaje);
        mensajeRepository.save(mensaje);
    }

    public void delete(final String id) {
        mensajeRepository.findById(id).ifPresent(entity -> {
            entity.markDeleted();
            mensajeRepository.save(entity);
        });
    }

    private MensajeDTO mapToDTO(final Mensaje mensaje, final MensajeDTO mensajeDTO) {
        mensajeDTO.setId(mensaje.getId());
        mensajeDTO.setFechaEnvio(mensaje.getFechaEnvio());
        mensajeDTO.setAsunto(mensaje.getAsunto());
        mensajeDTO.setContenido(mensaje.getContenido());
        mensajeDTO.setLeido(mensaje.getLeido());
        mensajeDTO.setEmisor(mensaje.getEmisorId());
        mensajeDTO.setReceptor(mensaje.getReceptorId());
        return mensajeDTO;
    }

    private Mensaje mapToEntity(final MensajeDTO mensajeDTO, final Mensaje mensaje) {
        mensaje.setFechaEnvio(mensajeDTO.getFechaEnvio());
        mensaje.setAsunto(mensajeDTO.getAsunto());
        mensaje.setContenido(mensajeDTO.getContenido());
        mensaje.setLeido(mensajeDTO.getLeido());
        if (mensajeDTO.getEmisor() != null) {
            personaRepository.findById(mensajeDTO.getEmisor())
                    .orElseThrow(() -> new NotFoundException("emisor not found"));
        }
        mensaje.setEmisorId(mensajeDTO.getEmisor());
        if (mensajeDTO.getReceptor() != null) {
            personaRepository.findById(mensajeDTO.getReceptor())
                    .orElseThrow(() -> new NotFoundException("receptor not found"));
        }
        mensaje.setReceptorId(mensajeDTO.getReceptor());
        return mensaje;
    }

}
