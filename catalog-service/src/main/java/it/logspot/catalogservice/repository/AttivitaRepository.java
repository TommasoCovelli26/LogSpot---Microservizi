package it.logspot.catalogservice.repository;

import com.logspot.service_catalogo.model.Attivita;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttivitaRepository extends MongoRepository<Attivita, String> {

    // Metodo magico di Spring: trova tutte le attività per una specifica patologia
    List<Attivita> findByPatologieContaining(String patologia);

    // Trova le attività create da uno specifico logopedista
    List<Attivita> findByCreatore(String creatoreId);
}