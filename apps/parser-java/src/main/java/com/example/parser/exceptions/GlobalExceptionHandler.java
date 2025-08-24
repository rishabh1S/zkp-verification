package com.example.parser.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(InvalidFileFormatException.class)
    public ResponseEntity<?> handleInvalidFile(InvalidFileFormatException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(errorResponse("INVALID_FILE_FORMAT", ex.getMessage()));
    }

    @ExceptionHandler(ExtractionFailedException.class)
    public ResponseEntity<?> handleExtractionError(ExtractionFailedException ex) {
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                .body(errorResponse("EXTRACTION_FAILED", ex.getMessage()));
    }

    @ExceptionHandler(ParserException.class)
    public ResponseEntity<?> handleParserException(ParserException ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(errorResponse("PARSER_ERROR", ex.getMessage()));
    }

    @ExceptionHandler(HashingException.class)
    public ResponseEntity<?> handleHashingException(HashingException ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(errorResponse("HASHING_ERROR", ex.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(errorResponse("ILLEGAL_ARGUMENT", ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGeneric(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(errorResponse("GENERIC_ERROR", ex.getMessage()));
    }

    private Map<String, Object> errorResponse(String code, String message) {
        return Map.of(
                "timestamp", Instant.now().toString(),
                "errorCode", code,
                "message", message);
    }
}
