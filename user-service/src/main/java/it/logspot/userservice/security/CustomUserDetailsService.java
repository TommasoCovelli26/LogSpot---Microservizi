package it.logspot.userservice.security;

import it.logspot.userservice.entity.Logopedista;
import it.logspot.userservice.entity.Paziente;
import it.logspot.userservice.repository.LogopedistaRepository;
import it.logspot.userservice.repository.PazienteRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final LogopedistaRepository logopedistaRepository;
    private final PazienteRepository pazienteRepository;

    public CustomUserDetailsService(LogopedistaRepository logopedistaRepository,
                                    PazienteRepository pazienteRepository) {

        this.logopedistaRepository = logopedistaRepository;
        this.pazienteRepository = pazienteRepository;

    }

    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        Logopedista logopedista = logopedistaRepository
                .findByEmail(email)
                .orElse(null);

        if (logopedista != null) {

            return new CustomUserDetails(
                    logopedista.getId(),
                    logopedista.getEmail(),
                    logopedista.getPassword(),
                    "LOGOPEDISTA"
            );

        }

        Paziente paziente = pazienteRepository
                .findByEmail(email)
                .orElse(null);

        if (paziente != null) {

            return new CustomUserDetails(
                    paziente.getId(),
                    paziente.getEmail(),
                    paziente.getPassword(),
                    "PAZIENTE"
            );

        }

        throw new UsernameNotFoundException(
                "Utente non trovato: " + email
        );

    }

}