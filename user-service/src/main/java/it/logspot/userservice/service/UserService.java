package it.logspot.userservice.service;

import it.logspot.userservice.dto.UpdateUserRequest;
import it.logspot.userservice.dto.UserResponse;
import it.logspot.userservice.entity.Logopedista;
import it.logspot.userservice.entity.Paziente;
import it.logspot.userservice.repository.LogopedistaRepository;
import it.logspot.userservice.repository.PazienteRepository;
import org.springframework.stereotype.Service;
import it.logspot.userservice.exception.UserNotFoundException;
import it.logspot.userservice.entity.Preferito;
import java.time.LocalDateTime;

import java.util.List;

import it.logspot.userservice.mapper.UserMapper;


@Service
public class UserService {

    private final LogopedistaRepository logopedistaRepository;
    private final PazienteRepository pazienteRepository;
    private final UserMapper mapper;
    private final ServiceBusPublisher serviceBusPublisher;


    public UserService(LogopedistaRepository logopedistaRepository,
                       PazienteRepository pazienteRepository,
                       UserMapper mapper,
                       ServiceBusPublisher serviceBusPublisher) {

        this.logopedistaRepository = logopedistaRepository;
        this.pazienteRepository = pazienteRepository;
        this.mapper = mapper;
        this.serviceBusPublisher = serviceBusPublisher;

    }

    public UserResponse getLogopedista(String id){

        Logopedista l = logopedistaRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Logopedista non trovato"));

        return mapper.toUserResponse(l);
    }

    public UserResponse getPaziente(String id){

        Paziente p = pazienteRepository.findByCf(id)
                .orElseThrow(() -> new UserNotFoundException("Paziente non trovato"));

        return mapper.toUserResponse(p);

    }

    public List<UserResponse> getPazientiByLogopedista(String logopedistaId){

        return pazienteRepository.findByLogopedista(logopedistaId)
                .stream()
                .map(mapper::toUserResponse)
                .toList();

    }

    public List<UserResponse> getUnassignedPazienti() {
        return pazienteRepository.findByLogopedistaIsNull()
                .stream()
                .map(mapper::toUserResponse)
                .toList();
    }

    public void updateLogopedista(String id, UpdateUserRequest request){

        Logopedista l = logopedistaRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Logopedista non trovato"));

        l.setNome(request.getNome());
        l.setCognome(request.getCognome());
        l.setEmail(request.getEmail());

        logopedistaRepository.save(l);

    }

    public void updatePaziente(String id, UpdateUserRequest request){

        Paziente p = pazienteRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Paziente non trovato"));

        p.setNome(request.getNome());
        p.setCognome(request.getCognome());
        p.setEmail(request.getEmail());

        pazienteRepository.save(p);

    }

    public UserResponse getUserById(String id, String role) {

        if ("LOGOPEDISTA".equals(role)) {
            return getLogopedista(id);
        }

        if ("PAZIENTE".equals(role)) {
            return getPaziente(id);
        }

        throw new UserNotFoundException("Ruolo non valido");

    }

    public void deleteLogopedista(String id) {

        Logopedista logopedista = logopedistaRepository.findById(id)
                .orElseThrow(() ->
                        new UserNotFoundException("Logopedista non trovato"));

        // Recupera tutti i pazienti associati al logopedista
        List<Paziente> pazienti = pazienteRepository.findByLogopedista(id);

        // Disaccoppia i pazienti
        for (Paziente paziente : pazienti) {
            paziente.setLogopedista(null);
        }

        pazienteRepository.saveAll(pazienti);

        System.out.println("Pazienti disaccoppiati dal logopedista " + id);

        // Elimina il logopedista
        logopedistaRepository.delete(logopedista);

        System.out.println("Logopedista rimosso dal DB Users.");

        // Invia evento al Service Bus
        serviceBusPublisher.publish(
                "LOGOPEDISTA_DELETED:" + id
        );

        System.out.println("📣 Evento LOGOPEDISTA_DELETED inviato ad Azure!");
    }

    public void deletePaziente(String id){

        Paziente paziente = pazienteRepository.findById(id)
                .orElseThrow(() ->
                        new UserNotFoundException("Paziente non trovato"));

        pazienteRepository.delete(paziente);

        System.out.println("Paziente rimosso dal DB Users.");

        // Invia il messaggio ad Azure
        serviceBusPublisher.publish("PATIENT_DELETED:" + id);
        System.out.println("📣 Evento PATIENT_DELETED inviato ad Azure!");

    }

    public List<Preferito> getPreferiti(String logopedistaId){

        Logopedista logopedista = logopedistaRepository.findById(logopedistaId)
                .orElseThrow(() ->
                        new UserNotFoundException("Logopedista non trovato"));

        return logopedista.getPreferiti();

    }

    public void addPreferito(String logopedistaId,
                             String attivitaId){

        Logopedista logopedista = logopedistaRepository.findById(logopedistaId)
                .orElseThrow(() ->
                        new UserNotFoundException("Logopedista non trovato"));

        boolean presente = logopedista.getPreferiti()
                .stream()
                .anyMatch(p -> p.getAttivita().equals(attivitaId));

        if(!presente){

            Preferito preferito = new Preferito();

            preferito.setAttivita(attivitaId);
            preferito.setDataSalvataggio(LocalDateTime.now());

            logopedista.getPreferiti().add(preferito);

            logopedistaRepository.save(logopedista);

        }

    }

    public void removePreferito(String logopedistaId,
                                String attivitaId){

        Logopedista logopedista = logopedistaRepository.findById(logopedistaId)
                .orElseThrow(() ->
                        new UserNotFoundException("Logopedista non trovato"));

        logopedista.getPreferiti()
                .removeIf(p -> p.getAttivita().equals(attivitaId));

        logopedistaRepository.save(logopedista);

    }

    public void assignPatient(String pazienteId,
                              String logopedistaId){

        Paziente paziente = pazienteRepository.findByCf(pazienteId)
                .orElseThrow(() ->
                        new UserNotFoundException("Paziente non trovato"));

        paziente.setLogopedista(logopedistaId);

        pazienteRepository.save(paziente);

    }

    public void unassignPatient(String pazienteId){

        Paziente paziente = pazienteRepository.findByCf(pazienteId)
                .orElseThrow(() ->
                        new UserNotFoundException("Paziente non trovato"));

        paziente.setLogopedista(null);

        pazienteRepository.save(paziente);

    }

}