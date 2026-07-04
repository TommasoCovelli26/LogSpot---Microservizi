package it.logspot.catalogservice.controller;

import com.logspot.service_catalogo.model.Attivita;
import it.logspot.catalogservice.repository.AttivitaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;

@RestController
@RequestMapping("/api/catalogo")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CatalogoController {

    private final AttivitaRepository attivitaRepository;

    // Sostituisce l'attuale "app/api/materiali-pubblici/route.ts"
    @GetMapping("/attivita")
    public ResponseEntity<List<Attivita>> getTutteLeAttivita() {
        try {
            return ResponseEntity.ok(attivitaRepository.findAll());
        } catch (DataAccessResourceFailureException ex) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        }
    }

    // Per recuperare i dettagli di un singolo materiale (app/api/materiali-pubblici/[id]/route.ts)
    @GetMapping("/attivita/{id}")
    public ResponseEntity<Attivita> getAttivitaSingola(@PathVariable String id) {
        try {
            return attivitaRepository.findById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (DataAccessResourceFailureException ex) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        }
    }

    // ----------------------------------------------------
    // CREAZIONE E GESTIONE ATTIVITÀ (SERVIZIO CATALOGO)
    // ----------------------------------------------------

    // 1. Crea una nuova Attività vuota
    @PostMapping("/attivita")
    public ResponseEntity<Attivita> creaAttivita(@RequestBody Attivita nuovaAttivita) {
        // Se le liste sono nulle, le inizializziamo vuote per evitare NullPointerException
        if (nuovaAttivita.getMateriali() == null) nuovaAttivita.setMateriali(List.of());
        if (nuovaAttivita.getCommenti() == null) nuovaAttivita.setCommenti(List.of());

        Attivita salvata = attivitaRepository.save(nuovaAttivita);
        return ResponseEntity.ok(salvata);
    }

    // 2. Aggiungi un "Materiale" (dettaglio tecnico) a un'attività esistente
    @PostMapping("/attivita/{id}/materiali")
    public ResponseEntity<Attivita> aggiungiMateriale(@PathVariable String id, @RequestBody Attivita.Materiale nuovoMateriale) {
        return attivitaRepository.findById(id).map(attivita -> {
            attivita.getMateriali().add(nuovoMateriale);
            return ResponseEntity.ok(attivitaRepository.save(attivita));
        }).orElse(ResponseEntity.notFound().build());
    }

    // 3. Aggiungi un Commento
    @PostMapping("/attivita/{id}/commenti")
    public ResponseEntity<Attivita> aggiungiCommento(@PathVariable String id, @RequestBody Attivita.Commento nuovoCommento) {
        nuovoCommento.setData(new java.util.Date()); // Imposta la data attuale
        return attivitaRepository.findById(id).map(attivita -> {
            attivita.getCommenti().add(nuovoCommento);
            return ResponseEntity.ok(attivitaRepository.save(attivita));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Restituisce una lista di Attività partendo da una lista di ID
    @PostMapping("/attivita/bulk")
    public ResponseEntity<List<Attivita>> getAttivitaInBulk(@RequestBody List<String> ids) {
        // findAllById è un metodo magico già integrato in MongoRepository!
        List<Attivita> attivita = (List<Attivita>) attivitaRepository.findAllById(ids);
        return ResponseEntity.ok(attivita);
    }
}