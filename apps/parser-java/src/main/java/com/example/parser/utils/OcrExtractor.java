package com.example.parser.utils;

import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;

import javax.imageio.ImageIO;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;
import net.sourceforge.tess4j.ITesseract;
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;

@Slf4j
@Component
public class OcrExtractor {

    @Value("${tessdata.path}")
    private String tessDataPath;

    public String ocrImage(File imageFile) {
        try {
            ITesseract tesseract = initTesseract(tessDataPath);
            BufferedImage src = ImageIO.read(imageFile);
            BufferedImage processed = preprocessImage(src);
            return tesseract.doOCR(processed);
        } catch (IOException | TesseractException e) {
            log.error("OCR failed on image: {}", e.getMessage());
            return "";
        }
    }

    public String ocrPdf(File pdfFile) {
        StringBuilder sb = new StringBuilder();
        try (PDDocument document = PDDocument.load(pdfFile)) {
            PDFRenderer renderer = new PDFRenderer(document);
            ITesseract tesseract = initTesseract(tessDataPath);

            for (int i = 0; i < document.getNumberOfPages(); i++) {
                BufferedImage page = renderer.renderImageWithDPI(i, 300);
                BufferedImage processed = preprocessImage(page);
                sb.append(performOcrOnPage(processed, tesseract, i)).append("\n");
            }
        } catch (IOException e) {
            log.error("Error loading PDF for OCR: {}", e.getMessage());
        }
        return sb.toString();
    }

    private String performOcrOnPage(BufferedImage pageImage, ITesseract tesseract, int pageIndex) {
        try {
            return tesseract.doOCR(pageImage);
        } catch (TesseractException e) {
            log.warn("OCR failed on page {}: {}", pageIndex, e.getMessage());
            return "";
        }
    }

    private ITesseract initTesseract(String tessDataPath) {
        ITesseract tesseract = new Tesseract();
        tesseract.setDatapath(tessDataPath);
        tesseract.setLanguage("eng");
        return tesseract;
    }

    private BufferedImage preprocessImage(BufferedImage src) {
        BufferedImage gray = new BufferedImage(src.getWidth(), src.getHeight(), BufferedImage.TYPE_BYTE_GRAY);
        Graphics2D g2 = gray.createGraphics();
        g2.drawImage(src, 0, 0, null);
        g2.dispose();
        return gray;
    }
}
