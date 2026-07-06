package it.logspot.catalogservice.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Commento {

    private String id;

    private String logopedista;

    private String messaggio;

    private LocalDateTime data;

}