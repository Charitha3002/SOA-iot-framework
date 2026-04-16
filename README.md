# SOA IoT Framework

This project demonstrates a Service-Oriented Architecture (SOA) applied to an Internet of Things (IoT) environment. It aims to provide a scalable, modular framework where distinct microservices handle different layers of IoT communication and data management.

## Project Principles

1. **Service-Oriented Architecture (SOA):** The system is entirely decoupled into microservices. Each service performs a distinct function (e.g., protocol translation, device registration) and communicates over well-defined network protocols.
2. **Scalability & Modularity:** By separating edge communication (MQTT) from backend logic (HTTP/REST), the system can be scaled independently depending on the bottleneck (e.g., scaling the protocol translator for heavier message loads).
3. **Protocol Interoperability:** Smart edge devices often use lightweight protocols like MQTT, while modern web backends typically operate over HTTP REST APIs. This framework bridges that conceptual gap using an intermediary middleware.
4. **Containerization:** The framework uses Docker to containerize services seamlessly, making it environment-agnostic and easy to run locally or deploy to the cloud.

## System Architecture & Workflow

The framework consists of three main components logically separated into the Edge, Middleware, and Microservices layers.

### 1. Smart Devices & Broker (Edge Stage)
IoT devices (such as smart thermostats or smart lights) generate telemetry data and publish this data to an MQTT Broker (Mosquitto for local deployment or AWS IoT Core) via lightweight MQTT messages.

### 2. Protocol Translator (Middleware Stage)
A Node.js-based protocol translator subscribes to the MQTT broker. Upon receiving an MQTT message, it transforms the raw telemetry payload into a structured JSON REST format. It then seamlessly forwards this standard JSON payload to the backend infrastructure via HTTP requests.

### 3. Device Registry API (Microservices Stage)
A Python-based backend (utilizing FastAPI) acts as the central device registry. It exposes a REST API that receives the transformed telemetric HTTP requests from the middleware. This registry reads and writes the device state into a database and serves this information to frontend client applications (Web/Mobile Apps).

## Getting Started

### Prerequisites
- Docker and Docker Compose
- MQTT client (optional, for testing)

### Running Locally
To launch the complete infrastructure locally, use Docker Compose:

```bash
docker-compose up --build
```

This will spin up:
- A local **Mosquitto MQTT Broker** on ports `1883` and `9001`.
- The **Device Registry API** on port `8000`.
- The **Protocol Translator** on port `3000` connected to both the broker and registry.

## Architecture Diagram Overview

- **Edge**: Devices publish telemetry via MQTT to the broker.
- **Middleware**: The translator consumes MQTT and performs an HTTP POST representation of the payload.
- **Microservices**: Device Registry receives the data, manages states, and interfaces with end-user applications.
