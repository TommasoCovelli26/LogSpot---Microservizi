package it.logspot.catalogservice.controller;


import it.logspot.catalogservice.dto.request.CreateCommentoRequest;
import it.logspot.catalogservice.entity.Commento;
import it.logspot.catalogservice.dto.request.CreateAttivitaRequest;
import it.logspot.catalogservice.dto.request.UpdateAttivitaRequest;
import it.logspot.catalogservice.dto.response.AttivitaResponse;
import it.logspot.catalogservice.service.CatalogService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import it.logspot.catalogservice.dto.request.CreateMaterialeRequest;
import it.logspot.catalogservice.entity.Materiale;
import it.logspot.catalogservice.dto.request.UpdateMaterialeRequest;
import it.logspot.catalogservice.dto.request.UpdateCommentoRequest;

import java.util.List;

@RestController
@RequestMapping(value = {"/catalog", "/catalog/"})
public class CatalogController {

    private final CatalogService service;

    public CatalogController(CatalogService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<AttivitaResponse>> getAll() {

        return ResponseEntity.ok(service.findAll());

    }

    @GetMapping("/{id}")
    public ResponseEntity<AttivitaResponse> getById(
            @PathVariable String id) {

        return ResponseEntity.ok(service.findById(id));

    }

    @PostMapping
    public ResponseEntity<AttivitaResponse> create(
            @Valid @RequestBody CreateAttivitaRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(service.create(request));

    }

    @PutMapping("/{id}")
    public ResponseEntity<AttivitaResponse> update(
            @PathVariable String id,
            @Valid @RequestBody UpdateAttivitaRequest request) {

        return ResponseEntity.ok(
                service.update(id, request)
        );

    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable String id) {

        service.delete(id);

        return ResponseEntity.noContent().build();

    }

    @PostMapping("/{id}/commenti")
    public ResponseEntity<AttivitaResponse> addCommento(
            @PathVariable String id,
            @Valid @RequestBody CreateCommentoRequest request){

        return ResponseEntity.ok(
                service.addCommento(id, request)
        );

    }

    @GetMapping("/{id}/commenti")
    public ResponseEntity<List<Commento>> getCommenti(
            @PathVariable String id){

        return ResponseEntity.ok(
                service.getCommenti(id)
        );

    }

    @PostMapping("/{id}/materiali")
    public ResponseEntity<AttivitaResponse> addMateriale(
            @PathVariable String id,
            @Valid @RequestBody CreateMaterialeRequest request){

        return ResponseEntity.ok(
                service.addMateriale(id, request)
        );

    }

    @GetMapping("/{id}/materiali")
    public ResponseEntity<List<Materiale>> getMateriali(
            @PathVariable String id){

        return ResponseEntity.ok(
                service.getMateriali(id)
        );

    }

    @PutMapping("/{id}/materiali/{materialeId}")
    public ResponseEntity<AttivitaResponse> updateMateriale(
            @PathVariable String id,
            @PathVariable String materialeId,
            @Valid @RequestBody UpdateMaterialeRequest request){

        return ResponseEntity.ok(
                service.updateMateriale(id, materialeId, request)
        );

    }

    @DeleteMapping("/{id}/materiali/{materialeId}")
    public ResponseEntity<AttivitaResponse> deleteMateriale(
            @PathVariable String id,
            @PathVariable String materialeId){

        return ResponseEntity.ok(
                service.deleteMateriale(id, materialeId)
        );

    }

    @PutMapping("/{id}/commenti/{commentoId}")
    public ResponseEntity<AttivitaResponse> updateCommento(
            @PathVariable String id,
            @PathVariable String commentoId,
            @Valid @RequestBody UpdateCommentoRequest request){

        return ResponseEntity.ok(
                service.updateCommento(id, commentoId, request)
        );

    }

    @DeleteMapping("/{id}/commenti/{commentoId}")
    public ResponseEntity<AttivitaResponse> deleteCommento(
            @PathVariable String id,
            @PathVariable String commentoId){

        return ResponseEntity.ok(
                service.deleteCommento(id, commentoId)
        );

    }

    @GetMapping("/search")
    public ResponseEntity<List<AttivitaResponse>> search(
            @RequestParam String query){

        return ResponseEntity.ok(
                service.search(query)
        );

    }

    @GetMapping("/patologia/{patologia}")
    public ResponseEntity<List<AttivitaResponse>> getByPatologia(
            @PathVariable String patologia){

        return ResponseEntity.ok(
                service.getByPatologia(patologia)
        );

    }

    @GetMapping("/accessibilita/{accessibilita}")
    public ResponseEntity<List<AttivitaResponse>> getByAccessibilita(
            @PathVariable Boolean accessibilita){

        return ResponseEntity.ok(
                service.getByAccessibilita(accessibilita)
        );

    }


}