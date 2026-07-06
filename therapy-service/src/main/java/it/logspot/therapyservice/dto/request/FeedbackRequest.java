package it.logspot.therapyservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class FeedbackRequest {

    @NotBlank
    private String messaggio;

}