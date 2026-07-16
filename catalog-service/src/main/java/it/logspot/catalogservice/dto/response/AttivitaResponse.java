package it.logspot.catalogservice.dto.response;

import it.logspot.catalogservice.entity.Commento;
import it.logspot.catalogservice.entity.Materiale;
import lombok.Data;

import java.util.List;

@Data
public class AttivitaResponse {

    private String id;

    private String titolo;

    private String descrizione;

    private List<String> patologie;

    private List<String> immagini;

    private Boolean accessibilita;

    private String creatore;

    private List<Materiale> materiali;

    private List<Commento> commenti;

}