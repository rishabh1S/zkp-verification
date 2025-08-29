package com.example.parser.model.entity;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.type.SqlTypes;
import org.springframework.data.annotation.CreatedDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@Table(name = "documents")
public class DocumentEntity {
    @Id
    @GeneratedValue(generator = "UUID")
    @UuidGenerator
    @Column(name = "document_id", nullable = false, columnDefinition = "uuid")
    private UUID documentId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "fields", columnDefinition = "jsonb")
    private Map<String, Object> fields;

    @Column(name = "confidence")
    private Float confidence;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}
