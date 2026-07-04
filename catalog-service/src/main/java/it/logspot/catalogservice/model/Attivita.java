package com.logspot.service_catalogo.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.List;

@Data
@Document(collection = "attivitas") // Mongoose aggiunge la 's' per il plurale di default
public class Attivita {

    @Id
    private String id;

    private String titolo;
    private String descrizione;
    private List<String> patologie;
    private Boolean accessibilita;

    // Riferimento al creatore (salviamo l'ID come String)
    private String creatore;

    private List<Materiale> materiali;
    private List<Commento> commenti;

    // Sub-documenti (gli array di oggetti nel tuo schema init-db.js)
    @Data
    public static class Materiale {
        private String tipo;
        private String domanda;
    }

    @Data
    public static class Commento {
        private String logopedista; // ID del logopedista
        private String messaggio;
        private Date data;
    }
}