FROM maven:3.8-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests

FROM selenium/standalone-chrome:latest

USER root
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        openjdk-17-jre \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar

USER seluser
ENTRYPOINT ["java", "-jar", "app.jar"]