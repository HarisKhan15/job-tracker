# ---------- 1) Build the Angular frontend ----------
FROM node:22-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npx ng build --configuration production

# ---------- 2) Build the Spring Boot jar (with Angular inside) ----------
FROM maven:3.9-eclipse-temurin-21 AS backend
WORKDIR /app/backend
COPY backend/pom.xml ./
RUN mvn -q -B dependency:go-offline
COPY backend/src ./src
COPY --from=frontend /app/frontend/dist/frontend/browser/ ./src/main/resources/static/
RUN mvn -q -B package -DskipTests

# ---------- 3) Small runtime image ----------
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=backend /app/backend/target/job-tracker.jar app.jar
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75 -XX:+UseSerialGC -Xss512k"
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
