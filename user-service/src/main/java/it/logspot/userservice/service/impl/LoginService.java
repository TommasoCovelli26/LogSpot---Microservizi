package it.logspot.userservice.service.impl;

import it.logspot.userservice.security.JwtService;

import it.logspot.userservice.dto.LoginRequest;
import it.logspot.userservice.dto.LoginResponse;
import it.logspot.userservice.dto.UserResponse;
import it.logspot.userservice.entity.Logopedista;
import it.logspot.userservice.entity.Paziente;
import it.logspot.userservice.exception.AuthenticationException;
import it.logspot.userservice.mapper.UserMapper;
import it.logspot.userservice.repository.LogopedistaRepository;
import it.logspot.userservice.repository.PazienteRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class LoginService {

    private final JwtService jwtService;
    private final LogopedistaRepository logopedistaRepository;
    private final PazienteRepository pazienteRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper mapper;

    public LoginService(
            LogopedistaRepository logopedistaRepository,
            PazienteRepository pazienteRepository,
            PasswordEncoder passwordEncoder,
            UserMapper mapper,
            JwtService jwtService) {

        this.logopedistaRepository = logopedistaRepository;
        this.pazienteRepository = pazienteRepository;
        this.passwordEncoder = passwordEncoder;
        this.mapper = mapper;
        this.jwtService = jwtService;
    }

    public LoginResponse login(LoginRequest request){

        var logopedista = logopedistaRepository.findByEmail(request.getEmail());

        if(logopedista.isPresent()){

            Logopedista l = logopedista.get();

            if(passwordEncoder.matches(request.getPassword(), l.getPassword())){

                return new LoginResponse(
                        jwtService.generateToken(
                                l.getId(),
                                l.getEmail(),
                                "LOGOPEDISTA"
                        ),
                        "LOGOPEDISTA",
                        mapper.toUserResponse(l)
                );

            }

        }

        var paziente = pazienteRepository.findByEmail(request.getEmail());

        if(paziente.isPresent()){

            Paziente p = paziente.get();

            if(passwordEncoder.matches(request.getPassword(), p.getPassword())){

                return new LoginResponse(
                        jwtService.generateToken(
                                p.getId(),
                                p.getEmail(),
                                "PAZIENTE"
                        ),
                        "PAZIENTE",
                        mapper.toUserResponse(p)
                );

            }

        }

        throw new AuthenticationException("Credenziali non valide");

    }

}