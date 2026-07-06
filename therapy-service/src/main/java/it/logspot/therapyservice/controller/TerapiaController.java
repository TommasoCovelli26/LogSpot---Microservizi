package it.logspot.therapyservice.controller;

import it.logspot.therapyservice.dto.request.AssignExerciseRequest;
import it.logspot.therapyservice.dto.request.FeedbackRequest;
import it.logspot.therapyservice.dto.request.UpdateExerciseRequest;
import it.logspot.therapyservice.dto.response.ExerciseResponse;
import it.logspot.therapyservice.entity.Esercizio;
import it.logspot.therapyservice.service.TherapyService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import it.logspot.therapyservice.dto.response.ProgressResponse;

import java.util.List;

@RestController
@RequestMapping("/api/terapia")
@CrossOrigin(origins = "*")
public class TerapiaController {

    private final TherapyService therapyService;

    public TerapiaController(TherapyService therapyService) {
        this.therapyService = therapyService;
    }

    @GetMapping("/pazienti/{pazienteId}/esercizi")
    public ResponseEntity<List<ExerciseResponse>> getEserciziPaziente(
            @PathVariable String pazienteId){

        return ResponseEntity.ok(
                therapyService.getPazienteExercises(pazienteId)
        );

    }

    @GetMapping("/logopedisti/{logopedistaId}/esercizi")
    public ResponseEntity<List<ExerciseResponse>> getEserciziLogopedista(
            @PathVariable String logopedistaId){

        return ResponseEntity.ok(
                therapyService.getLogopedistaExercises(logopedistaId)
        );

    }

    @GetMapping("/esercizi/{id}")
    public ResponseEntity<ExerciseResponse> getEsercizio(
            @PathVariable String id){

        return ResponseEntity.ok(
                therapyService.getExercise(id)
        );

    }

    @PostMapping("/esercizi")
    public ResponseEntity<ExerciseResponse> assegnaEsercizio(
            @Valid @RequestBody AssignExerciseRequest request){

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        therapyService.assignExercise(request)
                );

    }

    @PutMapping("/esercizi/{id}")
    public ResponseEntity<ExerciseResponse> updateEsercizio(
            @PathVariable String id,
            @Valid @RequestBody UpdateExerciseRequest request){

        return ResponseEntity.ok(
                therapyService.updateExercise(id, request)
        );

    }

    @DeleteMapping("/esercizi/{id}")
    public ResponseEntity<Void> deleteEsercizio(
            @PathVariable String id){

        therapyService.deleteExercise(id);

        return ResponseEntity.noContent().build();

    }

    @PostMapping("/esercizi/{id}/feedback")
    public ResponseEntity<ExerciseResponse> addFeedback(
            @PathVariable String id,
            @Valid @RequestBody FeedbackRequest request){

        return ResponseEntity.ok(
                therapyService.addFeedback(id, request)
        );

    }

    @GetMapping("/esercizi/{id}/feedback")
    public ResponseEntity<Esercizio.Feedback> getFeedback(
            @PathVariable String id){

        return ResponseEntity.ok(
                therapyService.getFeedback(id)
        );

    }

    @GetMapping("/pazienti/{id}/progressi")
    public ResponseEntity<ProgressResponse> getProgressi(
            @PathVariable String id){

        return ResponseEntity.ok(
                therapyService.getProgressi(id)
        );

    }


}