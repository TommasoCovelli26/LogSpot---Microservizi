package it.logspot.userservice.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "Paziente")
public class Paziente {

    @Id
    private String id;

    private String cf;

    private String nome;

    private String cognome;

    private String dataNascita;

    private String numTelefono;

    private String email;

    private String password;

    /**
     * ID del logopedista associato.
     */
    private String logopedista;
}