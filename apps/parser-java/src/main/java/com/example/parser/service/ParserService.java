package com.example.parser.service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.web.multipart.MultipartFile;

import com.example.parser.exceptions.ExtractionFailedException;
import com.example.parser.exceptions.ParserException;
import com.example.parser.model.ParseResult;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;

import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

import com.example.parser.exceptions.HashingException;

@Service
public class ParserService {

    public ParseResult parse(MultipartFile file) {
        try {
            // 1) Store raw file to temp directory (delete on exit)
            File tempFile = File.createTempFile("upload-", ".pdf");
            try (FileOutputStream fos = new FileOutputStream(tempFile)) {
                fos.write(file.getBytes());
            }

            // 2) Extract raw text
            String text;
            try (PDDocument document = PDDocument.load(tempFile)) {
                PDFTextStripper stripper = new PDFTextStripper();
                text = stripper.getText(document);
            }

            // 3) Extract fields via regex heuristics
            String dob = extractDateOfBirth(text);
            String income = extractIncome(text);
            String tax = extractTax(text);

            // 4) Hash sensitive fields
            Map<String, Object> fields = new HashMap<>();
            if (dob != null)
                fields.put("dobHash", sha256(dob));
            if (income != null)
                fields.put("incomeHash", sha256(income));
            if (tax != null)
                fields.put("taxHash", sha256(tax));

            // 5) Confidence scores (mocked for now, later from ML/heuristics)
            Map<String, Double> confidence = new HashMap<>();
            confidence.put("dob", dob != null ? 0.95 : 0.0);
            confidence.put("income", income != null ? 0.90 : 0.0);
            confidence.put("tax", tax != null ? 0.85 : 0.0);

            // Return ParseResult
            return new ParseResult(UUID.randomUUID().toString(), fields, confidence);
        } catch (IOException e) {
            throw new ExtractionFailedException("Failed to extract text from PDF: " + e.getMessage());
        } catch (Exception e) {
            throw new ParserException("Unexpected parsing error: " + e.getMessage());
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
}
