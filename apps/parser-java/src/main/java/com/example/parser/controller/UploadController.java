package com.example.parser.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.parser.exceptions.InvalidFileFormatException;
import com.example.parser.model.ParseResult;
import com.example.parser.service.ParserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class UploadController {

    private final ParserService parserService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadDocument(@RequestParam MultipartFile file) {
        try {
            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null || !originalFilename.endsWith(".pdf")) {
                throw new InvalidFileFormatException("Only PDF files are supported");
            }
            ParseResult result = parserService.parse(file);
            return ResponseEntity.ok(result);
        } catch (InvalidFileFormatException e) {
            return ResponseEntity.internalServerError().body("Parsing failed: " + e.getMessage());
        }
    }

}