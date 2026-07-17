package it.logspot.catalogservice.mapper;

import it.logspot.catalogservice.dto.request.CreateAttivitaRequest;
import it.logspot.catalogservice.dto.request.UpdateAttivitaRequest;
import it.logspot.catalogservice.dto.response.AttivitaResponse;
import it.logspot.catalogservice.entity.Attivita;
import org.springframework.stereotype.Component;

@Component
public class CatalogMapper {

    public Attivita toEntity(CreateAttivitaRequest request) {

        Attivita attivita = new Attivita();

        attivita.setTitolo(request.getTitolo());
        attivita.setDescrizione(request.getDescrizione());
        attivita.setIstruzioni(request.getIstruzioni());
        attivita.setFasciaEta(request.getFasciaEta() != null ? request.getFasciaEta() : 0);
        attivita.setPatologie(request.getPatologie());
        attivita.setImmagini(request.getImmagini());
        attivita.setAccessibilita(request.getAccessibilita());
        attivita.setCreatore(request.getCreatore());

        return attivita;
    }

    public void updateEntity(UpdateAttivitaRequest request,
                             Attivita attivita) {

        attivita.setTitolo(request.getTitolo());
        attivita.setDescrizione(request.getDescrizione());
        attivita.setIstruzioni(request.getIstruzioni());
        attivita.setFasciaEta(request.getFasciaEta() != null ? request.getFasciaEta() : 0);
        attivita.setPatologie(request.getPatologie());
        attivita.setImmagini(request.getImmagini());
        attivita.setAccessibilita(request.getAccessibilita());

    }

    public AttivitaResponse toResponse(Attivita attivita){

        AttivitaResponse response = new AttivitaResponse();

        response.setId(attivita.getId());
        response.setTitolo(attivita.getTitolo());
        response.setDescrizione(attivita.getDescrizione());
        response.setIstruzioni(attivita.getIstruzioni());
        response.setFasciaEta(attivita.getFasciaEta());
        response.setPatologie(attivita.getPatologie());
        response.setImmagini(attivita.getImmagini());
        response.setAccessibilita(attivita.getAccessibilita());
        response.setCreatore(attivita.getCreatore());
        response.setMateriali(attivita.getMateriali());
        response.setCommenti(attivita.getCommenti());

        return response;

    }

}