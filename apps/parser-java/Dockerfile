# Stage 1: Build the Spring Boot JAR
FROM maven:3.9.5-eclipse-temurin-17 AS build
WORKDIR /build
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests && mv target/*.jar target/app.jar

# Stage 2: Runtime with Tesseract + JAR only
FROM openjdk:17-slim
RUN apt-get update && apt-get install -y \
    libtesseract-dev \
    tesseract-ocr \
    tesseract-ocr-eng \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=build /build/target/app.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
