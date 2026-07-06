package it.logspot.therapyservice.repository;

import it.logspot.therapyservice.entity.Esercizio;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EsercizioRepository extends MongoRepository<Esercizio, String> {

    // Trova tutti gli esercizi assegnati a uno specifico paziente
    @Query("{'$or': [{'paziente': ?0}, {'pazienteId': ?0}]}")
    List<Esercizio> findByPaziente(String pazienteId);

    // Trova tutti gli esercizi assegnati da uno specifico logopedista
    @Query("{'$or': [{'logopedista': ?0}, {'logopedistaId': ?0}]}")
    List<Esercizio> findByLogopedista(String logopedistaId);
}