package it.logspot.therapyservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateExerciseRequest {

    @NotBlank
    private String attivita;

    @NotBlank
    private String logopedista;

    @NotBlank
    private String paziente;

    @NotNull
    private Integer durata;

    @NotBlank
    private String statoCompletamento;

}