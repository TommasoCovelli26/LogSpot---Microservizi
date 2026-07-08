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
        if (message != null && message.startsWith("PATIENT_DELETED:")) {
            // Estrae l'ID del paziente (es. da "PATIENT_DELETED:CF12345" estrae "CF12345")
            String pazienteId = message.split(":")[1];
            
            // Avvia l'eliminazione a cascata!
            therapyService.deleteExercisesByPaziente(pazienteId);
        }
    }
}