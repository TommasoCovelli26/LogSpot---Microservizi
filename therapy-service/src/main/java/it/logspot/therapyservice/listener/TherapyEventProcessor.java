package it.logspot.therapyservice.listener;

import com.azure.messaging.servicebus.ServiceBusClientBuilder;
import com.azure.messaging.servicebus.ServiceBusErrorContext;
import com.azure.messaging.servicebus.ServiceBusProcessorClient;
import com.azure.messaging.servicebus.ServiceBusReceivedMessageContext;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;

import org.springframework.stereotype.Component;

@Component
public class TherapyEventProcessor {

    private final ServiceBusProcessorClient processorClient;

    public TherapyEventProcessor(ServiceBusClientBuilder builder) {

        this.processorClient = builder
                .processor()

                .topicName("logspot-events")
                .subscriptionName("therapy-sub")

                .processMessage(this::processMessage)

                .processError(this::processError)

                .buildProcessorClient();
    }

    @PostConstruct
    public void start() {
        processorClient.start();
    }

    @PreDestroy
    public void stop() {
        processorClient.close();
    }

    private void processMessage(ServiceBusReceivedMessageContext context) {

        String body = context.getMessage().getBody().toString();

        System.out.println(body);

        // qui inserisci il codice che avevi nel vecchio @JmsListener
    }

    private void processError(ServiceBusErrorContext context) {

        context.getException().printStackTrace();
    }
}