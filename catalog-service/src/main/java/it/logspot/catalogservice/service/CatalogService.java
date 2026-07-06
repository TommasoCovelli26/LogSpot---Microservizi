package it.logspot.catalogservice.service;

import it.logspot.catalogservice.dto.request.CreateCommentoRequest;
import it.logspot.catalogservice.entity.Commento;

import java.time.LocalDateTime;

import it.logspot.catalogservice.dto.request.CreateAttivitaRequest;
import it.logspot.catalogservice.dto.request.UpdateAttivitaRequest;
import it.logspot.catalogservice.dto.response.AttivitaResponse;
import it.logspot.catalogservice.entity.Attivita;
import it.logspot.catalogservice.exception.AttivitaNotFoundException;
import it.logspot.catalogservice.mapper.CatalogMapper;
import it.logspot.catalogservice.repository.AttivitaRepository;
import org.springframework.stereotype.Service;

import it.logspot.catalogservice.dto.request.CreateMaterialeRequest;
import it.logspot.catalogservice.entity.Materiale;

import it.logspot.catalogservice.dto.request.UpdateMaterialeRequest;
import it.logspot.catalogservice.dto.request.UpdateCommentoRequest;

import java.util.List;

@Service
public class CatalogService {

    private final AttivitaRepository repository;
    private final CatalogMapper mapper;

    public CatalogService(AttivitaRepository repository,
                          CatalogMapper mapper) {

        this.repository = repository;
        this.mapper = mapper;

    }

    public List<AttivitaResponse> findAll(){

        return repository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();

    }

    public AttivitaResponse findById(String id){

        Attivita attivita = repository.findById(id)
                .orElseThrow(() ->
                        new AttivitaNotFoundException("Attività non trovata"));

        return mapper.toResponse(attivita);

    }

    public AttivitaResponse create(CreateAttivitaRequest request){

        Attivita attivita = mapper.toEntity(request);

        repository.save(attivita);

        return mapper.toResponse(attivita);

    }

    public AttivitaResponse update(String id,
                                   UpdateAttivitaRequest request){

        Attivita attivita = repository.findById(id)
                .orElseThrow(() ->
                        new AttivitaNotFoundException("Attività non trovata"));

        mapper.updateEntity(request, attivita);

        repository.save(attivita);

        return mapper.toResponse(attivita);

    }

    public void delete(String id){

        Attivita attivita = repository.findById(id)
                .orElseThrow(() ->
                        new AttivitaNotFoundException("Attività non trovata"));

        repository.delete(attivita);

    }

    public AttivitaResponse addCommento(String attivitaId,
                                        CreateCommentoRequest request){

        Attivita attivita = repository.findById(attivitaId)
                .orElseThrow(() ->
                        new AttivitaNotFoundException("Attività non trovata"));

        Commento commento = new Commento();

        commento.setId(java.util.UUID.randomUUID().toString());
        commento.setLogopedista(request.getLogopedista());
        commento.setMessaggio(request.getMessaggio());
        commento.setData(LocalDateTime.now());

        attivita.getCommenti().add(commento);

        repository.save(attivita);

        return mapper.toResponse(attivita);

    }

    public List<Commento> getCommenti(String attivitaId){

        Attivita attivita = repository.findById(attivitaId)
                .orElseThrow(() ->
                        new AttivitaNotFoundException("Attività non trovata"));

        return attivita.getCommenti();

    }

    public AttivitaResponse addMateriale(String attivitaId,
                                         CreateMaterialeRequest request){

        Attivita attivita = repository.findById(attivitaId)
                .orElseThrow(() ->
                        new AttivitaNotFoundException("Attività non trovata"));

        Materiale materiale = new Materiale();

        materiale.setId(java.util.UUID.randomUUID().toString());
        materiale.setTipo(request.getTipo());
        materiale.setTitolo(request.getTitolo());
        materiale.setDescrizione(request.getDescrizione());
        materiale.setUrl(request.getUrl());
        materiale.setDifficolta(request.getDifficolta());

        attivita.getMateriali().add(materiale);

        repository.save(attivita);

        return mapper.toResponse(attivita);

    }

    public List<Materiale> getMateriali(String attivitaId){

        Attivita attivita = repository.findById(attivitaId)
                .orElseThrow(() ->
                        new AttivitaNotFoundException("Attività non trovata"));

        return attivita.getMateriali();

    }

    public AttivitaResponse updateMateriale(String attivitaId,
                                            String materialeId,
                                            UpdateMaterialeRequest request){

        Attivita attivita = repository.findById(attivitaId)
                .orElseThrow(() ->
                        new AttivitaNotFoundException("Attività non trovata"));

        Materiale materiale = attivita.getMateriali()
                .stream()
                .filter(m -> m.getId().equals(materialeId))
                .findFirst()
                .orElseThrow(() ->
                        new RuntimeException("Materiale non trovato"));

        materiale.setTipo(request.getTipo());
        materiale.setTitolo(request.getTitolo());
        materiale.setDescrizione(request.getDescrizione());
        materiale.setUrl(request.getUrl());
        materiale.setDifficolta(request.getDifficolta());

        repository.save(attivita);

        return mapper.toResponse(attivita);

    }

    public AttivitaResponse deleteMateriale(String attivitaId,
                                            String materialeId){

        Attivita attivita = repository.findById(attivitaId)
                .orElseThrow(() ->
                        new AttivitaNotFoundException("Attività non trovata"));

        attivita.getMateriali()
                .removeIf(m -> m.getId().equals(materialeId));

        repository.save(attivita);

        return mapper.toResponse(attivita);

    }

    public AttivitaResponse updateCommento(String attivitaId,
                                           String commentoId,
                                           UpdateCommentoRequest request){

        Attivita attivita = repository.findById(attivitaId)
                .orElseThrow(() ->
                        new AttivitaNotFoundException("Attività non trovata"));

        Commento commento = attivita.getCommenti()
                .stream()
                .filter(c -> c.getId().equals(commentoId))
                .findFirst()
                .orElseThrow(() ->
                        new RuntimeException("Commento non trovato"));

        commento.setMessaggio(request.getMessaggio());

        repository.save(attivita);

        return mapper.toResponse(attivita);

    }

    public AttivitaResponse deleteCommento(String attivitaId,
                                           String commentoId){

        Attivita attivita = repository.findById(attivitaId)
                .orElseThrow(() ->
                        new AttivitaNotFoundException("Attività non trovata"));

        attivita.getCommenti()
                .removeIf(c -> c.getId().equals(commentoId));

        repository.save(attivita);

        return mapper.toResponse(attivita);

    }

    public List<AttivitaResponse> search(String query){

        return repository.findByTitoloContainingIgnoreCase(query)
                .stream()
                .map(mapper::toResponse)
                .toList();

    }

}