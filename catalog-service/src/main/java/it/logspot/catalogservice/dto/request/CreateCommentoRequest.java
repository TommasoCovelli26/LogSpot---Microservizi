package it.logspot.catalogservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateCommentoRequest {

    @NotBlank
    private String logopedista;

    @NotBlank
    private String messaggio;

}