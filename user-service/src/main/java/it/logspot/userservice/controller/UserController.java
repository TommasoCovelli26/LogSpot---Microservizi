package it.logspot.userservice.controller;

import it.logspot.userservice.dto.UpdateUserRequest;
import it.logspot.userservice.dto.UserResponse;
import it.logspot.userservice.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import it.logspot.userservice.security.CustomUserDetails;
import org.springframework.security.core.context.SecurityContextHolder;

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

    //@GetMapping("/me")
    //public ResponseEntity<UserResponse> me() {
//
      //  CustomUserDetails user =
       //         (CustomUserDetails) SecurityContextHolder
        //                .getContext()
        //                .getAuthentication()
        //                .getPrincipal();
//
        //return ResponseEntity.ok(
        //        userService.getUserById(
        //                user.getId(),
         //               user.getRole()
           //     )
       // );

    //}

}