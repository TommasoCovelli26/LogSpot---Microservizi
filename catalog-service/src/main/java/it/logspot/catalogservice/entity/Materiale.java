package it.logspot.catalogservice.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Materiale {

    private String id;

    // TESTO, IMMAGINE, AUDIO, VIDEO...
    private String tipo;

    // Titolo del materiale
    private String titolo;

    // Domanda o descrizione
    private String descrizione;

    // URL del file se presente
    private String url;

    // Facile, Medio, Difficile
    private String difficolta;

}