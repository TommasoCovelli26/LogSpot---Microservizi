package it.logspot.catalogservice.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "Attivita")
public class Attivita {

    @Id
    private String id;

    private String titolo;

    private String descrizione;

    private List<String> patologie = new ArrayList<>();

    private Boolean accessibilita;

    private String creatore;

    private List<Materiale> materiali = new ArrayList<>();

    private List<Commento> commenti = new ArrayList<>();

}