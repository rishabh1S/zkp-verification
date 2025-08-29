package com.example.parser.model.dto;

import lombok.Data;

@Data
public class DatePattern {
    final String regex;
    final float weight;
    final String format;
}
