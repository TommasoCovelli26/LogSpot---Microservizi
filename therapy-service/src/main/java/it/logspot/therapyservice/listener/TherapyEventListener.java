package it.logspot.therapyservice.listener;

import it.logspot.therapyservice.service.TherapyService;
import org.springframework.jms.annotation.JmsListener;
import org.springframework.stereotype.Component;

@Component
public class TherapyEventListener {

    private final TherapyService therapyService;

    public TherapyEventListener(TherapyService therapyService) {
        this.therapyService = therapyService;
    }

    // Ascolta il topic "logspot-events" tramite la tua sottoscrizione "therapy-sub"
    @JmsListener(destination = "logspot-events", subscription = "therapy-sub")
    public void receiveMessage(String message) {
        System.out.println("📩 Evento ricevuto da Azure Service Bus: " + message);
        
        // Se il messaggio è un comando di eliminazione paziente
        if (message == null) {
            return;
        }

        if (message.startsWith("PATIENT_DELETED:")) {

            String pazienteId = message.split(":")[1];

            therapyService.deleteExercisesByPaziente(pazienteId);

        }
        else if (message.startsWith("LOGOPEDISTA_DELETED:")) {

            String logopedistaId = message.split(":")[1];

            therapyService.deleteExercisesByLogopedista(logopedistaId);

        }
    }
}