package it.logspot.userservice.service;

import com.azure.messaging.servicebus.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class ServiceBusPublisher {

    private final ServiceBusSenderClient sender;

    public ServiceBusPublisher(
            @Value("${azure.servicebus.connection-string}") String connectionString) {

        this.sender = new ServiceBusClientBuilder()

                .connectionString(connectionString)

                .sender()

                .topicName("logspot-events")

                .buildClient();
    }

    public void publish(String message) {

        sender.sendMessage(new ServiceBusMessage(message));

    }
}