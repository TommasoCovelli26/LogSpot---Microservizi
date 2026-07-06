package it.logspot.catalogservice.repository;

import it.logspot.catalogservice.entity.Attivita;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttivitaRepository extends MongoRepository<Attivita, String> {

    List<Attivita> findByCreatore(String creatore);

    List<Attivita> findByTitoloContainingIgnoreCase(String titolo);

    List<Attivita> findByPatologieContaining(String patologia);

    List<Attivita> findByAccessibilita(Boolean accessibilita);

    List<Attivita> findByDescrizioneContainingIgnoreCase(String descrizione);

    List<Attivita> findByPatologieContainingIgnoreCase(String patologia);

}