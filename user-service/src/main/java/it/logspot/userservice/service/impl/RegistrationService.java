package it.logspot.userservice.service.impl;

import it.logspot.userservice.dto.RegisterLogopedistaRequest;
import it.logspot.userservice.dto.RegisterPazienteRequest;
import it.logspot.userservice.entity.Logopedista;
import it.logspot.userservice.entity.Paziente;
import it.logspot.userservice.exception.EmailAlreadyExistsException;
import it.logspot.userservice.repository.LogopedistaRepository;
import it.logspot.userservice.repository.PazienteRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class RegistrationService {

    private final LogopedistaRepository logopedistaRepository;
    private final PazienteRepository pazienteRepository;
    private final PasswordEncoder passwordEncoder;

    public RegistrationService(LogopedistaRepository logopedistaRepository,
                               PazienteRepository pazienteRepository,
                               PasswordEncoder passwordEncoder) {

        this.logopedistaRepository = logopedistaRepository;
        this.pazienteRepository = pazienteRepository;
        this.passwordEncoder = passwordEncoder;

    }

    public void registerLogopedista(RegisterLogopedistaRequest request){

        if(logopedistaRepository.existsByEmail(request.getEmail()))
            throw new EmailAlreadyExistsException("Email già presente");

        Logopedista logopedista = new Logopedista();

        logopedista.setNome(request.getNome());
        logopedista.setCognome(request.getCognome());
        logopedista.setEmail(request.getEmail());
        logopedista.setDataNascita(request.getDataNascita());
        logopedista.setNumTelefono(request.getNumTelefono());
        logopedista.setPassword(
                passwordEncoder.encode(request.getPassword())
        );
        logopedista.setPIva(request.getPIva());

        logopedistaRepository.save(logopedista);

    }

    public void registerPaziente(RegisterPazienteRequest request){

        if(pazienteRepository.existsByEmail(request.getEmail()))
            throw new EmailAlreadyExistsException("Email già presente");

        Paziente paziente = new Paziente();

        paziente.setNome(request.getNome());
        paziente.setCognome(request.getCognome());
        paziente.setEmail(request.getEmail());
        paziente.setPassword(
                passwordEncoder.encode(request.getPassword())
        );
        paziente.setCf(request.getCf());
        paziente.setDataNascita(request.getDataNascita());
        paziente.setNumTelefono(request.getNumTelefono());
        paziente.setLogopedista(request.getLogopedista());

        pazienteRepository.save(paziente);

    }

}