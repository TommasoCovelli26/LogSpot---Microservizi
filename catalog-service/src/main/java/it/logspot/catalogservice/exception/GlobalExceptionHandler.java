package it.logspot.catalogservice.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AttivitaNotFoundException.class)
    public ResponseEntity<String> handleNotFound(
            AttivitaNotFoundException ex){

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ex.getMessage());

    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleGeneric(
            Exception ex){

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ex.getMessage());

    }

}