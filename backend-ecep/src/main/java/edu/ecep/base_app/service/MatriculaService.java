package edu.ecep.base_app.service;

import edu.ecep.base_app.domain.Matricula;
import edu.ecep.base_app.mappers.MatriculaMapper;
import edu.ecep.base_app.dtos.MatriculaDTO;
import edu.ecep.base_app.repos.MatriculaRepository;
import edu.ecep.base_app.util.NotFoundException;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class MatriculaService {

    private final MatriculaRepository matriculaRepository;
    private final MatriculaMapper matriculaMapper;

    public MatriculaService(MatriculaRepository matriculaRepository,
                            MatriculaMapper matriculaMapper) {
        this.matriculaRepository = matriculaRepository;
        this.matriculaMapper = matriculaMapper;
    }

    public List<MatriculaDTO> findAll() {
        return matriculaRepository.findAll(Sort.by("id")).stream()
                .map(matriculaMapper::toDto)
                .toList();
    }

    public MatriculaDTO get(Long id) {
        return matriculaRepository.findById(id)
                .map(matriculaMapper::toDto)
                .orElseThrow(NotFoundException::new);
    }

    public Long create(MatriculaDTO dto) {
        Matricula entity = matriculaMapper.toEntity(dto);
        return matriculaRepository.save(entity).getId();
    }

    public void update(Long id, MatriculaDTO dto) {
        Matricula existing = matriculaRepository.findById(id)
                .orElseThrow(NotFoundException::new);
        matriculaMapper.updateEntityFromDto(dto, existing);
        matriculaRepository.save(existing);
    }

    public void delete(Long id) {
        matriculaRepository.deleteById(id);
    }
}

