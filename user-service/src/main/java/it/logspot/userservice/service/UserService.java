package it.logspot.userservice.service;

import it.logspot.userservice.dto.UpdateUserRequest;
import it.logspot.userservice.dto.UserResponse;
import it.logspot.userservice.entity.Logopedista;
import it.logspot.userservice.entity.Paziente;
import it.logspot.userservice.repository.LogopedistaRepository;
import it.logspot.userservice.repository.PazienteRepository;
import org.springframework.stereotype.Service;
import it.logspot.userservice.exception.UserNotFoundException;

import java.util.List;

import it.logspot.userservice.mapper.UserMapper;

@Service
public class UserService {

    private final LogopedistaRepository logopedistaRepository;
    private final PazienteRepository pazienteRepository;
    private final UserMapper mapper;

    public UserService(LogopedistaRepository logopedistaRepository,
                       PazienteRepository pazienteRepository,
                       UserMapper mapper) {

        this.logopedistaRepository = logopedistaRepository;
        this.pazienteRepository = pazienteRepository;
        this.mapper = mapper;

    }

    public UserResponse getLogopedista(String id){

        Logopedista l = logopedistaRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Logopedista non trovato"));

        return mapper.toUserResponse(l);
    }

    public UserResponse getPaziente(String id){

        Paziente p = pazienteRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Paziente non trovato"));

        return mapper.toUserResponse(p);

    }

    public List<UserResponse> getPazientiByLogopedista(String logopedistaId){

        return pazienteRepository.findByLogopedista(logopedistaId)
                .stream()
                .map(mapper::toUserResponse)
                .toList();

    }

    public void updateLogopedista(String id, UpdateUserRequest request){

        Logopedista l = logopedistaRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Logopedista non trovato"));

        l.setNome(request.getNome());
        l.setCognome(request.getCognome());
        l.setEmail(request.getEmail());

        logopedistaRepository.save(l);

    }

    public void updatePaziente(String id, UpdateUserRequest request){

        Paziente p = pazienteRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Paziente non trovato"));

        p.setNome(request.getNome());
        p.setCognome(request.getCognome());
        p.setEmail(request.getEmail());

        pazienteRepository.save(p);

    }

    public UserResponse getUserById(String id, String role) {

        if ("LOGOPEDISTA".equals(role)) {
            return getLogopedista(id);
        }

        if ("PAZIENTE".equals(role)) {
            return getPaziente(id);
        }

        throw new UserNotFoundException("Ruolo non valido");

    }

}