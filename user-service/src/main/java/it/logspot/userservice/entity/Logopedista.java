package it.logspot.userservice.entity;

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
@Document(collection = "Logopedista")
public class Logopedista {

    @Id
    private String id;

    private String pIva;

    private String nome;

    private String cognome;

    private String email;

    private String password;

    private List<Preferito> preferiti = new ArrayList<>();
}