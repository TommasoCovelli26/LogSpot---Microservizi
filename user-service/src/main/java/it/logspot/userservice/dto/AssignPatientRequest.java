package it.logspot.userservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AssignPatientRequest {

    @NotBlank
    private String logopedistaId;

}