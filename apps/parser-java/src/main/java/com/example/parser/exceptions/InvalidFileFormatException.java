package com.example.parser.exceptions;

public class InvalidFileFormatException extends RuntimeException {
    public InvalidFileFormatException(String message) {
        super(message);
    }
}
