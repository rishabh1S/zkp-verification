package com.example.parser.service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.parser.exceptions.ExtractionFailedException;
import com.example.parser.model.ParseResult;
import com.example.parser.utils.ExtractorUtil;
import com.example.parser.utils.HashUtil;
import com.example.parser.utils.OcrExtractor;
import com.example.parser.utils.PdfTextExtractor;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class ParserService {

    private final PdfTextExtractor pdfTextExtractor;
    private final OcrExtractor ocrExtractor;
    private final ExtractorUtil extractorUtil;
    private final HashUtil hashUtil;

    private static final int MIN_TEXT_LENGTH = 20;

    public ParseResult parse(MultipartFile file) {
        File tempFile = null;
        try {
            tempFile = storeTempFile(file);

            String text = extractContent(file.getOriginalFilename(), tempFile);
            String dob = extractorUtil.extractDob(text);

            Map<String, Object> fields = new HashMap<>();
            if (dob != null) {
                fields.put("dobPreview", dob);
                fields.put("dobHash", hashUtil.sha256(dob));
            }

            float confidence = dob != null ? 0.95f : 0.0f;

            return new ParseResult(UUID.randomUUID().toString(), fields, confidence);

        } catch (IOException e) {
            throw new ExtractionFailedException("Failed to extract text from document: " + e.getMessage());
        } finally {
            cleanupTempFile(tempFile);
        }
    }

    private File storeTempFile(MultipartFile file) throws IOException {
        String suffix = file.getOriginalFilename().toLowerCase().endsWith(".pdf") ? ".pdf" : ".img";
        File tempFile = File.createTempFile("upload-", suffix);
        try (FileOutputStream fos = new FileOutputStream(tempFile)) {
            fos.write(file.getBytes());
        }
        return tempFile;
    }

    private String extractContent(String filename, File file) {
        if (filename.toLowerCase().endsWith(".pdf")) {
            String text = pdfTextExtractor.extract(file);
            if (text == null || text.trim().length() < MIN_TEXT_LENGTH) {
                log.info("PDF appears image-based; running OCR");
                return ocrExtractor.ocrPdf(file);
            }
            return text;
        } else {
            log.info("Running OCR on image: {}", filename);
            return ocrExtractor.ocrImage(file);
        }
    }

    private void cleanupTempFile(File tempFile) {
        if (tempFile != null && tempFile.exists()) {
            try {
                Files.delete(tempFile.toPath());
            } catch (IOException e) {
                log.warn("Could not delete temp file: {}", tempFile.getAbsolutePath(), e);
            }
        }
    }
}