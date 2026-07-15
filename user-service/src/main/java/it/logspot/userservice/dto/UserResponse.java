package it.logspot.userservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserResponse {

    private String id;

    private String nome;

    private String cognome;

    private String email;

    private String ruolo;

    @JsonProperty("pIva")
    private String pIva;

    @JsonProperty("cf")
    private String cf;

    private String dataNascita;

    private String numTelefono;

}