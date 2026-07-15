package it.logspot.catalogservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateMaterialeRequest {

    @NotBlank
    private String tipo;

    @NotBlank
    private String titolo;

    
    private String descrizione;

    private String url;

    @NotBlank
    private String difficolta;

}