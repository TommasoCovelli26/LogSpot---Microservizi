package it.logspot.therapyservice.dto.response;

import lombok.Data;

@Data
public class ProgressResponse {

    private int totale;

    private int completati;

    private int daSvolgere;

    private double percentuale;

}