package com.example.parser.model.dto;

import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ParseResult {
    private String documentId;
    private Map<String, Object> fields;
    private float confidence;
}
