package com.example.parser.utils;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;

import org.springframework.stereotype.Component;

import com.example.parser.model.dto.DatePattern;
import com.example.parser.model.dto.ExtractionContext;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class ConfidenceCalculator {
    // Common date patterns for DOB with weights
    private static final List<DatePattern> DATE_PATTERNS = Arrays.asList(
            new DatePattern("\\b\\d{2}/\\d{2}/\\d{4}\\b", 0.95f, "dd/MM/yyyy"),
            new DatePattern("\\b\\d{2}-\\d{2}-\\d{4}\\b", 0.95f, "dd-MM-yyyy"),
            new DatePattern("\\b\\d{4}/\\d{2}/\\d{2}\\b", 0.90f, "yyyy/MM/dd"),
            new DatePattern("\\b\\d{4}-\\d{2}-\\d{2}\\b", 0.90f, "yyyy-MM-dd"),
            new DatePattern("\\b\\d{1,2}/\\d{1,2}/\\d{4}\\b", 0.85f, "d/M/yyyy"),
            new DatePattern("\\b\\d{1,2}-\\d{1,2}-\\d{4}\\b", 0.85f, "d-M-yyyy"));

    // Simple context keywords for DOB
    private static final List<String> DOB_KEYWORDS = Arrays.asList(
            "date of birth", "birth date", "dob", "d.o.b");

    /**
     * Calculate overall confidence for document parsing
     */
    public float calculateConfidence(ExtractionContext context, String extractedDob) {
        log.debug("Calculating confidence - DOB present: {}, OCR used: {}",
                extractedDob != null, context.isUsedOcr());

        if (extractedDob == null || extractedDob.trim().isEmpty()) {
            return 0.0f; // No DOB found
        }

        float confidence = 0.0f;
        // 1. Basic text presence (30%)
        confidence += (context.getText() != null && context.getText().length() >= 10) ? 0.3f : 0.0f;

        // 2. DOB pattern matching (40%)
        confidence += calculateDobPatternScore(extractedDob) * 0.4f;

        // 3. DOB context validation (20%)
        confidence += calculateContextScore(context.getText(), extractedDob) * 0.2f;

        // 4. Extraction method (10%)
        confidence += calculateExtractionMethodScore(context) * 0.1f;

        log.info("Final confidence: {:.3f}", confidence);
        return Math.max(0.0f, Math.min(1.0f, confidence));
    }

    private float calculateDobPatternScore(String dob) {
        String cleanDob = dob.trim();

        // Find matching pattern
        for (DatePattern pattern : DATE_PATTERNS) {
            if (Pattern.matches(pattern.getRegex(), cleanDob)) {
                // Validate the date if possible
                if (isValidDate(cleanDob, pattern.getFormat())) {
                    return pattern.getWeight();
                } else {
                    return pattern.getWeight() * 0.5f; // Pattern matches but invalid date
                }
            }
        }
        return 0.1f; // No pattern matched
    }

    private float calculateContextScore(String fullText, String dob) {
        if (fullText == null || fullText.trim().isEmpty()) {
            return 0.5f; // Neutral if no context
        }

        String lowerText = fullText.toLowerCase();

        // Check for DOB keywords in context
        for (String keyword : DOB_KEYWORDS) {
            if (lowerText.contains(keyword)) {
                int keywordIndex = lowerText.indexOf(keyword);
                int dobIndex = lowerText.indexOf(dob.toLowerCase());

                if (dobIndex != -1 && Math.abs(keywordIndex - dobIndex) <= 50) {
                    return 1.0f; // Strong context match
                }
                return 0.7f; // Keyword found but not close to DOB
            }
        }

        return 0.3f; // No relevant context found
    }

    private float calculateExtractionMethodScore(ExtractionContext context) {
        if (context.isUsedOcr()) {
            // OCR is less reliable
            return hasGoodOcrQuality(context.getText()) ? 0.75f : 0.55f;
        } else {
            // Direct PDF text extraction is more reliable
            return 0.95f;
        }
    }

    private boolean hasGoodOcrQuality(String text) {
        if (text == null || text.length() < 10) {
            return false;
        }

        // Count alphanumeric characters vs total
        long alphanumericCount = text.chars()
                .filter(Character::isLetterOrDigit)
                .count();

        double alphanumericRatio = (double) alphanumericCount / text.length();
        return alphanumericRatio > 0.6; // Good ratio indicates clean OCR
    }

    private boolean isValidDate(String dateString, String format) {
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern(format);
            LocalDate parsedDate = LocalDate.parse(dateString, formatter);

            // Basic validation - date should be reasonable for DOB
            LocalDate now = LocalDate.now();
            LocalDate minDate = now.minusYears(120); // Max 120 years old
            LocalDate maxDate = now.minusYears(1); // At least 1 year old

            return !parsedDate.isBefore(minDate) && !parsedDate.isAfter(maxDate);

        } catch (DateTimeParseException e) {
            log.debug("Date validation failed for: {} with format: {}", dateString, format);
            return false;
        }
    }
}
