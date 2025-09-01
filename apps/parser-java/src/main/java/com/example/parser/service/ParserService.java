package com.example.parser.service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.parser.exceptions.ExtractionFailedException;
import com.example.parser.model.dto.ExtractionContext;
import com.example.parser.model.dto.ParseResult;
import com.example.parser.model.entity.DocumentEntity;
import com.example.parser.repository.DocumentRepository;
import com.example.parser.utils.ConfidenceCalculator;
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
    private final DocumentRepository documentRepository;
    private final ConfidenceCalculator confidenceCalculator;

    private static final int MIN_TEXT_LENGTH = 20;

    public ParseResult parse(MultipartFile file) {
        File tempFile = null;
        try {
            tempFile = storeTempFile(file);

            ExtractionContext context = extractContentWithContext(file.getOriginalFilename(), tempFile);
            String dob = extractorUtil.extractDob(context.getText());

            Map<String, Object> fields = new HashMap<>();
            if (dob != null) {
                fields.put("dobPreview", dob);
                fields.put("dobHash", hashUtil.sha256(dob));
            }

            float confidence = confidenceCalculator.calculateConfidence(context, dob);

            log.info("Processed file: {} - DOB found: {}, Confidence: {:.3f}",
                    file.getOriginalFilename(), dob != null, confidence);

            DocumentEntity entity = new DocumentEntity();
            entity.setFields(fields);
            entity.setConfidence(confidence);
            entity.setCreatedAt(Instant.now());

            documentRepository.save(entity);

            return new ParseResult(entity.getDocumentId().toString(), fields, confidence);

        } catch (IOException e) {
            throw new ExtractionFailedException("Failed to extract text from document: " + e.getMessage());
        } finally {
            cleanupTempFile(tempFile);
        }
    }

    public ParseResult getParsedDocument(UUID documentId) {
        return documentRepository.findById(documentId)
                .map(entity -> new ParseResult(
                        entity.getDocumentId().toString(),
                        entity.getFields() != null ? entity.getFields() : new HashMap<>(),
                        entity.getConfidence()))
                .orElse(null);
    }

    private File storeTempFile(MultipartFile file) throws IOException {
        String originalFilename = file.getOriginalFilename();
        String safeName = (originalFilename != null) ? originalFilename.toLowerCase() : "";

        String suffix = safeName.endsWith(".pdf") ? ".pdf" : ".img";

        File tempFile = File.createTempFile("upload-", suffix);
        try (FileOutputStream fos = new FileOutputStream(tempFile)) {
            fos.write(file.getBytes());
        }
        return tempFile;
    }

    private ExtractionContext extractContentWithContext(String filename, File file) {
        boolean usedOcr = false;
        String text;

        if (filename != null && filename.toLowerCase().endsWith(".pdf")) {
            text = pdfTextExtractor.extract(file);
            if (text == null || text.trim().length() < MIN_TEXT_LENGTH) {
                log.info("PDF appears image-based; running OCR for: {}", filename);
                text = ocrExtractor.ocrPdf(file);
                usedOcr = true;
            }
        } else {
            log.info("Running OCR on image: {}", filename);
            text = ocrExtractor.ocrImage(file);
            usedOcr = true;
        }

        return new ExtractionContext(text, usedOcr, filename);
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