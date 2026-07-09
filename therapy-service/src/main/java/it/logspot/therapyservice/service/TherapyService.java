package it.logspot.therapyservice.service;

import it.logspot.therapyservice.dto.request.AssignExerciseRequest;
import it.logspot.therapyservice.dto.request.FeedbackRequest;
import it.logspot.therapyservice.dto.request.UpdateExerciseRequest;
import it.logspot.therapyservice.dto.response.ExerciseResponse;
import it.logspot.therapyservice.entity.Esercizio;
import it.logspot.therapyservice.exception.ExerciseNotFoundException;
import it.logspot.therapyservice.mapper.TherapyMapper;
import it.logspot.therapyservice.repository.EsercizioRepository;
import org.springframework.stereotype.Service;
import it.logspot.therapyservice.dto.response.ProgressResponse;

import java.util.Date;
import java.util.List;

@Service
public class TherapyService {

    private final EsercizioRepository repository;
    private final TherapyMapper mapper;

    public TherapyService(EsercizioRepository repository,
                          TherapyMapper mapper) {

        this.repository = repository;
        this.mapper = mapper;

    }

    public List<ExerciseResponse> getPazienteExercises(String pazienteId){

        return repository.findByPaziente(pazienteId)
                .stream()
                .map(mapper::toResponse)
                .toList();

    }

    public List<ExerciseResponse> getLogopedistaExercises(String logopedistaId){

        return repository.findByLogopedista(logopedistaId)
                .stream()
                .map(mapper::toResponse)
                .toList();

    }

    public ExerciseResponse getExercise(String id){

        Esercizio esercizio = repository.findById(id)
                .orElseThrow(() ->
                        new ExerciseNotFoundException("Esercizio non trovato"));

        return mapper.toResponse(esercizio);

    }

    public ExerciseResponse assignExercise(AssignExerciseRequest request){

        Esercizio esercizio = mapper.toEntity(request);

        esercizio.setDataAssegnazione(new Date());
        esercizio.setStatoCompletamento("DA_SVOLGERE");

        repository.save(esercizio);

        return mapper.toResponse(esercizio);

    }

    public ExerciseResponse updateExercise(String id,
                                           UpdateExerciseRequest request){

        Esercizio esercizio = repository.findById(id)
                .orElseThrow(() ->
                        new ExerciseNotFoundException("Esercizio non trovato"));

        mapper.updateEntity(request, esercizio);

        repository.save(esercizio);

        return mapper.toResponse(esercizio);

    }

    public void deleteExercisesByPaziente(String pazienteId) {
        repository.deleteByPaziente(pazienteId);
        System.out.println("Eliminazione a cascata completata: Esercizi rimossi per il paziente " + pazienteId);
    }

    public void deleteExercisesByLogopedista(String logopedistaId) {

        repository.deleteByLogopedista(logopedistaId);

        System.out.println(
                "Eliminazione a cascata completata: esercizi rimossi per il logopedista "
                        + logopedistaId);

    }
    
    public void deleteExercise(String id){

        Esercizio esercizio = repository.findById(id)
                .orElseThrow(() ->
                        new ExerciseNotFoundException("Esercizio non trovato"));

        repository.delete(esercizio);

    }

    public ExerciseResponse addFeedback(String id,
                                        FeedbackRequest request){

        Esercizio esercizio = repository.findById(id)
                .orElseThrow(() ->
                        new ExerciseNotFoundException("Esercizio non trovato"));

        Esercizio.Feedback feedback = new Esercizio.Feedback();

        feedback.setMessaggio(request.getMessaggio());
        feedback.setData(new Date());

        esercizio.setFeedback(feedback);
        esercizio.setStatoCompletamento("COMPLETATO");

        repository.save(esercizio);

        return mapper.toResponse(esercizio);

    }

    public Esercizio.Feedback getFeedback(String id){

        Esercizio esercizio = repository.findById(id)
                .orElseThrow(() ->
                        new ExerciseNotFoundException("Esercizio non trovato"));

        return esercizio.getFeedback();

    }

    public ProgressResponse getProgressi(String pazienteId){

        List<Esercizio> esercizi = repository.findByPaziente(pazienteId);

        ProgressResponse response = new ProgressResponse();

        int totale = esercizi.size();

        int completati = (int) esercizi.stream()
                .filter(e -> "COMPLETATO".equalsIgnoreCase(e.getStatoCompletamento()))
                .count();

        int daSvolgere = totale - completati;

        double percentuale = totale == 0
                ? 0
                : ((double) completati / totale) * 100;

        response.setTotale(totale);
        response.setCompletati(completati);
        response.setDaSvolgere(daSvolgere);
        response.setPercentuale(percentuale);

        return response;

    }


}