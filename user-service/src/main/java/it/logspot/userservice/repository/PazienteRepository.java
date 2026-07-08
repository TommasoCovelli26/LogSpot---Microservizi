package it.logspot.userservice.repository;

import it.logspot.userservice.entity.Paziente;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PazienteRepository extends MongoRepository<Paziente, String> {

    Optional<Paziente> findByEmail(String email);

    Optional<Paziente> findByCf(String cf);

    boolean existsByEmail(String email);

    boolean existsByCf(String cf);

    List<Paziente> findByLogopedista(String logopedista);

    List<Paziente> findByLogopedistaIsNull();

}