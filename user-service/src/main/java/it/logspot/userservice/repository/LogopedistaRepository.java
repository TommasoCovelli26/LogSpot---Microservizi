package it.logspot.userservice.repository;

import it.logspot.userservice.entity.Logopedista;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LogopedistaRepository extends MongoRepository<Logopedista, String> {

    Optional<Logopedista> findByEmail(String email);

    Optional<Logopedista> findByPIva(String pIva);

    boolean existsByEmail(String email);

    boolean existsByPIva(String pIva);

}