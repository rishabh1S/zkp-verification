package com.example.parser.utils;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.stereotype.Component;

@Component
public class ExtractorUtil {

    private static final Pattern DOB_PATTERN = Pattern.compile(
            "(?i)(DOB|Date of Birth|Birth Date)[:\\s]*" +
                    "(\\d{2}[/-]\\d{2}[/-]\\d{4}|\\d{4}-\\d{2}-\\d{2})");

    public String extractDob(String text) {
        Matcher matcher = DOB_PATTERN.matcher(text);
        return matcher.find() ? matcher.group(2) : null;
    }
}
