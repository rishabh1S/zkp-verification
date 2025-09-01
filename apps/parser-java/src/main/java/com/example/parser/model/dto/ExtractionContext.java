package com.example.parser.model.dto;

import lombok.Data;

@Data
public class ExtractionContext {
    private final String text;
    private final boolean usedOcr;
    private final String filename;
}
