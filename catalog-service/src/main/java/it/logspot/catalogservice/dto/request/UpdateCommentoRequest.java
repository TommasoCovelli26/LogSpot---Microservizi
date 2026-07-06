package it.logspot.catalogservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateCommentoRequest {

    @NotBlank
    private String messaggio;

}