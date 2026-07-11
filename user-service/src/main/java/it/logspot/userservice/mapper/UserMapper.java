package it.logspot.userservice.mapper;

import it.logspot.userservice.dto.UserResponse;
import it.logspot.userservice.entity.Logopedista;
import it.logspot.userservice.entity.Paziente;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserResponse toUserResponse(Logopedista logopedista){

        return new UserResponse(
                logopedista.getId(),
                logopedista.getNome(),
                logopedista.getCognome(),
                logopedista.getEmail(),
                "LOGOPEDISTA",
                logopedista.getPIva(),
                null,
                logopedista.getDataNascita(),
                logopedista.getNumTelefono()
        );

    }

    public UserResponse toUserResponse(Paziente paziente){

        return new UserResponse(
                paziente.getId(),
                paziente.getNome(),
                paziente.getCognome(),
                paziente.getEmail(),
                "PAZIENTE",
                null,
                paziente.getCf(),
                paziente.getDataNascita(),
                paziente.getNumTelefono()
        );

    }

}