package it.logspot.userservice.controller;

import it.logspot.userservice.dto.LoginRequest;
import it.logspot.userservice.dto.LoginResponse;
import it.logspot.userservice.dto.RegisterLogopedistaRequest;
import it.logspot.userservice.dto.RegisterPazienteRequest;
import it.logspot.userservice.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request) {

        return ResponseEntity.ok(authService.login(request));

    }

    @PostMapping("/register/logopedista")
    public ResponseEntity<Void> registerLogopedista(
            @Valid @RequestBody RegisterLogopedistaRequest request) {

        authService.registerLogopedista(request);

        return ResponseEntity.status(HttpStatus.CREATED).build();

    }

    @PostMapping("/register/paziente")
    public ResponseEntity<Void> registerPaziente(
            @Valid @RequestBody RegisterPazienteRequest request) {

        authService.registerPaziente(request);

        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

}