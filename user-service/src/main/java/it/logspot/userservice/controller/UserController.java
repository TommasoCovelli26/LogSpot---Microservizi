package it.logspot.userservice.controller;

import it.logspot.userservice.dto.UpdateUserRequest;
import it.logspot.userservice.dto.UserResponse;
import it.logspot.userservice.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import it.logspot.userservice.security.CustomUserDetails;
import org.springframework.security.core.context.SecurityContextHolder;
import it.logspot.userservice.entity.Preferito;
import it.logspot.userservice.dto.AssignPatientRequest;

import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/logopedista/{id}")
    public ResponseEntity<UserResponse> getLogopedista(
            @PathVariable String id) {

        return ResponseEntity.ok(userService.getLogopedista(id));

    }

    @GetMapping("/paziente/{id}")
    public ResponseEntity<UserResponse> getPaziente(
            @PathVariable String id) {

        return ResponseEntity.ok(userService.getPaziente(id));

    }

    @PutMapping("/logopedista/{id}")
    public ResponseEntity<Void> updateLogopedista(
            @PathVariable String id,
            @Valid @RequestBody UpdateUserRequest request) {

        userService.updateLogopedista(id, request);

        return ResponseEntity.ok().build();

    }

    @PutMapping("/paziente/{id}")
    public ResponseEntity<Void> updatePaziente(
            @PathVariable String id,
            @Valid @RequestBody UpdateUserRequest request) {

        userService.updatePaziente(id, request);

        return ResponseEntity.ok().build();

    }

    @GetMapping("/logopedista/{id}/pazienti")
    public ResponseEntity<List<UserResponse>> getPazienti(
            @PathVariable String id) {

        return ResponseEntity.ok(
                userService.getPazientiByLogopedista(id)
        );

    }

    @DeleteMapping("/logopedista/{id}")
    public ResponseEntity<Void> deleteLogopedista(
            @PathVariable String id){

        userService.deleteLogopedista(id);

        return ResponseEntity.noContent().build();

    }

    @DeleteMapping("/paziente/{id}")
    public ResponseEntity<Void> deletePaziente(
            @PathVariable String id){

        userService.deletePaziente(id);

        return ResponseEntity.noContent().build();

    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me() {

        CustomUserDetails user =
                (CustomUserDetails) SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getPrincipal();

        return ResponseEntity.ok(
                userService.getUserById(
                        user.getId(),
                        user.getRole()
                )
        );

    }

    @GetMapping("/logopedista/{id}/preferiti")
    public ResponseEntity<List<Preferito>> getPreferiti(
            @PathVariable String id){

        return ResponseEntity.ok(
                userService.getPreferiti(id)
        );

    }

    @PostMapping("/logopedista/{id}/preferiti/{attivitaId}")
    public ResponseEntity<Void> addPreferito(
            @PathVariable String id,
            @PathVariable String attivitaId){

        userService.addPreferito(id, attivitaId);

        return ResponseEntity.ok().build();

    }

    @DeleteMapping("/logopedista/{id}/preferiti/{attivitaId}")
    public ResponseEntity<Void> removePreferito(
            @PathVariable String id,
            @PathVariable String attivitaId){

        userService.removePreferito(id, attivitaId);

        return ResponseEntity.noContent().build();

    }

    @PutMapping("/paziente/{id}/logopedista")
    public ResponseEntity<Void> assignPatient(
            @PathVariable String id,
            @Valid @RequestBody AssignPatientRequest request){

        userService.assignPatient(id, request.getLogopedistaId());

        return ResponseEntity.ok().build();

    }

    @DeleteMapping("/paziente/{id}/logopedista")
    public ResponseEntity<Void> unassignPatient(
            @PathVariable String id){

        userService.unassignPatient(id);

        return ResponseEntity.noContent().build();

    }

}