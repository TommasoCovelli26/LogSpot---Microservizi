package it.logspot.userservice.service;

import it.logspot.userservice.dto.LoginRequest;
import it.logspot.userservice.dto.LoginResponse;
import it.logspot.userservice.dto.RegisterLogopedistaRequest;
import it.logspot.userservice.dto.RegisterPazienteRequest;
import it.logspot.userservice.service.impl.LoginService;
import it.logspot.userservice.service.impl.RegistrationService;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final LoginService loginService;
    private final RegistrationService registrationService;

    public AuthService(LoginService loginService,
                       RegistrationService registrationService) {

        this.loginService = loginService;
        this.registrationService = registrationService;

    }

    public LoginResponse login(LoginRequest request){

        return loginService.login(request);

    }

    public void registerLogopedista(RegisterLogopedistaRequest request){

        registrationService.registerLogopedista(request);

    }

    public void registerPaziente(RegisterPazienteRequest request){

        registrationService.registerPaziente(request);

    }

}