package it.logspot.therapyservice.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import java.util.Date;

@Data
@Document(collection = "esercizios")
public class Esercizio {

    @Id
    private String id;

    private Date dataAssegnazione;

    private String statoCompletamento;

    private Integer durata;

    @Field(targetType = FieldType.OBJECT_ID)
    private String attivita;

    @Field(targetType = FieldType.OBJECT_ID)
    private String logopedista;

    @Field(targetType = FieldType.OBJECT_ID)
    private String paziente;

    private Feedback feedback;

    @Data
    public static class Feedback {

        private String messaggio;

        private Date data;

    }

}