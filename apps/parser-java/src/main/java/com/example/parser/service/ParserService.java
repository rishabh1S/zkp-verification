package com.example.parser.service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.aspose.ocr.AsposeOCR;
import com.aspose.ocr.RecognitionResult;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.aspose.ocr.IDCardRecognitionSettings;
import com.aspose.ocr.Language;
import com.example.parser.exceptions.ExtractionFailedException;
import com.example.parser.exceptions.HashingException;
import com.example.parser.exceptions.ParserException;
import com.example.parser.model.ParseResult;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class ParserService {

    public static final Language EN_LANGUAGE = Language.Eng;

    public ParseResult parse(MultipartFile file, String fieldType) {
        File tempFile = null;
        try {
            // 1) Store raw file temporarily
            tempFile = File.createTempFile("upload-", ".pdf");
            try (FileOutputStream fos = new FileOutputStream(tempFile)) {
                fos.write(file.getBytes());
            }

            log.info("Stored temporary file at: {}", tempFile.getAbsolutePath());

            // 2) Run Aspose OCR (works on both PDFs & image-based PDFs)
            AsposeOCR api = new AsposeOCR();
            IDCardRecognitionSettings settings = new IDCardRecognitionSettings();
            settings.setLanguage(EN_LANGUAGE);

            com.aspose.ocr.OcrInput ocrInput = new com.aspose.ocr.OcrInput(com.aspose.ocr.InputType.PDF);
            ocrInput.add(tempFile.getAbsolutePath());

            RecognitionResult result = api.RecognizeIDCard(ocrInput, settings).get(0);
            String text = result.recognitionText;
            log.info("Extracted Text: \n{}" + text);

            // 3) Extract only the requested field
            String rawValue = null;
            double confidence = 0.0;

            switch (fieldType) {
                case "dob" -> {
                    rawValue = extractDateOfBirth(text);
                    confidence = rawValue != null ? 0.95 : 0.0;
                }
                case "income" -> {
                    rawValue = extractIncome(text);
                    confidence = rawValue != null ? 0.90 : 0.0;
                }
                case "tax" -> {
                    rawValue = extractTax(text);
                    confidence = rawValue != null ? 0.85 : 0.0;
                }
                default -> throw new ParserException("Unsupported fieldType: " + fieldType);
            }

            // 4) Build output maps
            Map<String, Object> fields = new HashMap<>();
            if (rawValue != null) {
                fields.put(fieldType + "Hash", sha256(rawValue));
                fields.put(fieldType + "Preview", maskValue(rawValue, fieldType));
            }

            Map<String, Double> confidenceMap = new HashMap<>();
            confidenceMap.put(fieldType, confidence);

            return new ParseResult(UUID.randomUUID().toString(), fields, confidenceMap);

        } catch (IOException e) {
            throw new ExtractionFailedException("Failed to extract text from PDF: " + e.getMessage());
        } catch (ParserException e) {
            throw new ParserException("Unexpected parsing error: " + e.getMessage());
        } finally {
            // Always delete the temp file
            if (tempFile != null && tempFile.exists()) {
                try {
                    Files.delete(tempFile.toPath());
                } catch (IOException ex) {
                    log.warn("Temp file could not be deleted: {}", tempFile.getAbsolutePath(), ex);
                }
            }
        }
    }

    private String extractDateOfBirth(String text) {
        // Example regex: DD/MM/YYYY or YYYY-MM-DD
        Pattern pattern = Pattern.compile("(\\d{2}[/-]\\d{2}[/-]\\d{4}|\\d{4}-\\d{2}-\\d{2})");
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            return matcher.group();
        }
        return null;
    }

    private String extractIncome(String text) {
        // Example: "Income: 1200000" or "Annual Income Rs. 10,00,000"
        Pattern pattern = Pattern.compile("(Income[:\s]+)([0-9,]+)");
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            return matcher.group(2).replace(",", "");
        }
        return null;
    }

    private String extractTax(String text) {
        // Example: "Tax Paid: 100000"
        Pattern pattern = Pattern.compile("(Tax\\s*Paid[:\\s]+)([0-9,]+)");
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            return matcher.group(2).replace(",", "");
        }
        return null;
    }

    private String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : hash)
                hex.append(String.format("%02x", b));
            return hex.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new HashingException("Error computing SHA-256 hash", e);
        }
    }

    private String maskValue(String value, String fieldType) {
        if ("dob".equals(fieldType) && value.length() >= 4) {
            return "****-**-" + value.substring(value.length() - 2);
        } else if (("income".equals(fieldType) || "tax".equals(fieldType)) && value.length() > 3) {
            return "****" + value.substring(value.length() - 3);
        }
        return "****";
    }
}
