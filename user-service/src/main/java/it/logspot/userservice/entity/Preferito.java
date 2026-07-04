package it.logspot.userservice.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Preferito {

    private String attivita;

    private LocalDateTime dataSalvataggio;
}