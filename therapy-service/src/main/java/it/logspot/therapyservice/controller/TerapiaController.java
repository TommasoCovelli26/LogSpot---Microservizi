package it.logspot.therapyservice.controller;

import it.logspot.therapyservice.model.Esercizio;
import it.logspot.therapyservice.repository.EsercizioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/terapia")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // FONDAMENTALE PER NEXT.JS
public class TerapiaController {

    private final EsercizioRepository esercizioRepository;

    // 1. Il paziente vede i SUOI esercizi
    @GetMapping("/pazienti/{pazienteId}/esercizi")
    public ResponseEntity<List<Esercizio>> getEserciziPaziente(@PathVariable String pazienteId) {
        return ResponseEntity.ok(esercizioRepository.findByPaziente(pazienteId));
    }

    // 2. Il logopedista vede gli esercizi che HA ASSEGNATO
    @GetMapping("/logopedisti/{logopedistaId}/esercizi")
    public ResponseEntity<List<Esercizio>> getEserciziLogopedista(@PathVariable String logopedistaId) {
        return ResponseEntity.ok(esercizioRepository.findByLogopedista(logopedistaId));
    }

    // 3. Il logopedista ASSEGNA un nuovo esercizio a un paziente
    @PostMapping("/esercizi")
    public ResponseEntity<Esercizio> assegnaEsercizio(@RequestBody Esercizio nuovoEsercizio) {
        nuovoEsercizio.setDataAssegnazione(new Date());
        if (nuovoEsercizio.getStatoCompletamento() == null) {
            nuovoEsercizio.setStatoCompletamento("da-svolgere");
        }
        return ResponseEntity.ok(esercizioRepository.save(nuovoEsercizio));
    }

    // 4. Il paziente INVIA un feedback (e completa l'esercizio)
    @PostMapping("/esercizi/{id}/feedback")
    public ResponseEntity<Esercizio> aggiungiFeedback(@PathVariable String id, @RequestBody Esercizio.Feedback feedback) {
        return esercizioRepository.findById(id).map(esercizio -> {
            feedback.setData(new Date());
            esercizio.setFeedback(feedback);
            esercizio.setStatoCompletamento("completato"); // Aggiorniamo automaticamente lo stato
            return ResponseEntity.ok(esercizioRepository.save(esercizio));
        }).orElse(ResponseEntity.notFound().build());
    }
}