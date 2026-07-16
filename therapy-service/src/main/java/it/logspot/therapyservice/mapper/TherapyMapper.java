package it.logspot.therapyservice.mapper;

import it.logspot.therapyservice.dto.request.AssignExerciseRequest;
import it.logspot.therapyservice.dto.request.UpdateExerciseRequest;
import it.logspot.therapyservice.dto.response.ExerciseResponse;
import it.logspot.therapyservice.entity.Esercizio;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class TherapyMapper {

    public Esercizio toEntity(AssignExerciseRequest request) {

        Esercizio esercizio = new Esercizio();

        esercizio.setAttivita(request.getAttivita());
        esercizio.setLogopedista(request.getLogopedista());
        esercizio.setPaziente(request.getPaziente());
        esercizio.setDurata(request.getDurata());

        return esercizio;
    }

    public void updateEntity(UpdateExerciseRequest request,
                             Esercizio esercizio){

        esercizio.setAttivita(request.getAttivita());
        esercizio.setLogopedista(request.getLogopedista());
        esercizio.setPaziente(request.getPaziente());
        esercizio.setDurata(request.getDurata());
        esercizio.setStatoCompletamento(request.getStatoCompletamento());

    }

    public ExerciseResponse toResponse(Esercizio esercizio){

        ExerciseResponse response = new ExerciseResponse();

        response.setId(esercizio.getId());
        response.setDataAssegnazione(esercizio.getDataAssegnazione());
        response.setStatoCompletamento(esercizio.getStatoCompletamento());
        response.setDurata(esercizio.getDurata());
        response.setAttivita(esercizio.getAttivita());
        response.setLogopedista(esercizio.getLogopedista());
        response.setPaziente(esercizio.getPaziente());
        response.setFeedbacks(esercizio.getFeedbacks());

        return response;

    }

}