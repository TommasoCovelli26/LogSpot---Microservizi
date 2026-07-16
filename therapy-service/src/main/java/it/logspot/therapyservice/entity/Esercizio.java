package it.logspot.therapyservice.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Data
@Document(collection = "esercizios")
public class Esercizio {

    @Id
    private String id;

    private Date dataAssegnazione;

    private String statoCompletamento;

    private Integer durata;

    private String attivita;

    private String logopedista;

    private String paziente;

    private List<Feedback> feedbacks = new ArrayList<>();

    @Data
    public static class Feedback {

        private String id;

        private String messaggio;

        private Date data;

    }

}