package com.example.parser.service;

import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
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

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.parser.exceptions.ExtractionFailedException;
import com.example.parser.exceptions.HashingException;
import com.example.parser.exceptions.ParserException;
import com.example.parser.model.ParseResult;

import lombok.extern.slf4j.Slf4j;
import net.sourceforge.tess4j.ITesseract;
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;

@Service
@Slf4j
public class ParserService {

    private static final int MIN_TEXT_LENGTH = 20;

    public ParseResult parse(MultipartFile file) {
        File tempFile = null;
        try {
            // 1) Store raw file temporarily
            tempFile = File.createTempFile("upload-", ".pdf");
            try (FileOutputStream fos = new FileOutputStream(tempFile)) {
                fos.write(file.getBytes());
            }

            // 2) Extract text from PDF using PDFBox
            String text = extractTextFromPdf(tempFile);

            // 3) If text too short -> image-based PDF -> run OCR
            if (text == null || text.trim().length() < MIN_TEXT_LENGTH) {
                log.info("PDF appears image-based; running OCR");
                text = ocrPdfToText(tempFile);
            }

            // 4) Extract DOB
            String dob = extractDateOfBirth(text);

            // 5) Build response
            Map<String, Object> fields = new HashMap<>();
            if (dob != null) {
                fields.put("dobPreview", maskValue(dob));
                fields.put("dobHash", sha256(dob));
            }
            return new ParseResult(UUID.randomUUID().toString(), fields);

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

    // try to extract embedded text (fast)
    private String extractTextFromPdf(File pdfFile) {
        try (PDDocument document = PDDocument.load(pdfFile)) {
            return new PDFTextStripper().getText(document);
        } catch (IOException e) {
            log.warn("PDFTextStripper failed: {}", e.getMessage());
            return "";
        }
    }

    // Render PDF pages to images and run OCR (Tess4J)
    private String ocrPdfToText(File pdfFile) {
        StringBuilder sb = new StringBuilder();

        try (PDDocument document = PDDocument.load(pdfFile)) {
            PDFRenderer renderer = new PDFRenderer(document);
            ITesseract tesseract = new Tesseract();
            tesseract.setDatapath("/usr/share/tesseract-ocr/4.00/tessdata");
            tesseract.setLanguage("eng");
            for (int i = 0; i < document.getNumberOfPages(); i++) {
                BufferedImage pageImage = renderer.renderImageWithDPI(i, 300);
                BufferedImage prepared = preprocessImage(pageImage);
                try {
                    String pageText = tesseract.doOCR(prepared);
                    if (pageText != null)
                        sb.append(pageText).append("\n");
                } catch (TesseractException e) {
                    log.warn("Tesseract OCR failed on page {}: {}", i, e.getMessage());
                }
            }
        } catch (IOException e) {
            log.error("Error loading PDF for OCR: {}", e.getMessage());
        }
        return sb.toString();
    }

    // basic preprocessing: scale & convert to grayscale (improve OCR)
    private BufferedImage preprocessImage(BufferedImage src) {
        int targetW = src.getWidth();
        int targetH = src.getHeight();
        BufferedImage resized = new BufferedImage(targetW, targetH, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = resized.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g.drawImage(src, 0, 0, targetW, targetH, null);
        g.dispose();

        // optionally convert to grayscale / binarize
        BufferedImage gray = new BufferedImage(resized.getWidth(), resized.getHeight(), BufferedImage.TYPE_BYTE_GRAY);
        Graphics2D g2 = gray.createGraphics();
        g2.drawImage(resized, 0, 0, null);
        g2.dispose();

        return gray;
    }

    private String extractDateOfBirth(String text) {
        Pattern pattern = Pattern.compile(
                "(?i)(DOB|Date of Birth|Birth Date)[:\\s]*"
                        + "(\\d{2}[/-]\\d{2}[/-]\\d{4}|\\d{4}-\\d{2}-\\d{2})");
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            return matcher.group(2);
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

    private String maskValue(String value) {
        return "****-**-" + value.substring(value.length() - 2);
    }
}