package it.logspot.catalogservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class CreateAttivitaRequest {

    @NotBlank
    private String titolo;

    @NotBlank
    private String descrizione;

    @NotNull
    private Boolean accessibilita;

    @NotNull
    private List<String> patologie;

    @NotBlank
    private String creatore;

}