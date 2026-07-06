package it.logspot.therapyservice.dto.response;

import it.logspot.therapyservice.entity.Esercizio;
import lombok.Data;

import java.util.Date;

@Data
public class ExerciseResponse {

    private String id;

    private Date dataAssegnazione;

    private String statoCompletamento;

    private Integer durata;

    private String attivita;

    private String logopedista;

    private String paziente;

    private Esercizio.Feedback feedback;

}