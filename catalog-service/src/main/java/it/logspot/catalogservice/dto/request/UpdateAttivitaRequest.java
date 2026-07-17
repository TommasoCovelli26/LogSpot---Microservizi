package it.logspot.catalogservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class UpdateAttivitaRequest {

    @NotBlank
    private String titolo;

    @NotBlank
    private String descrizione;

    private String istruzioni;

    private Integer fasciaEta;

    @NotNull
    private Boolean accessibilita;

    @NotNull
    private List<String> patologie;

    private List<String> immagini;

}