const mqtt = require('mqtt');
const axios = require('axios');
const express = require('express');

// Configuration
const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://mqtt-broker:1883'; // Use 'mqtt://localhost:1883' for local
const REGISTRY_API_URL = process.env.REGISTRY_API_URL || 'http://device-registry:8000'; // FastAPI service URL
const PORT = process.env.PORT || 3000;

// Initialize Express for accepting REST commands from the registry 
// to translate back to MQTT commands to devices
const app = express();
app.use(express.json());

// Initialize MQTT Client
console.log(`Connecting to MQTT Broker at ${MQTT_BROKER}`);
const client = mqtt.connect(MQTT_BROKER);

client.on('connect', () => {
    console.log('Connected to MQTT Broker');
    // Subscribe to all device data topics
    client.subscribe('devices/+/data', (err) => {
        if (!err) {
            console.log('Subscribed to topic pattern: devices/+/data');
        }
    });
});

// Handle incoming MQTT messages
client.on('message', async (topic, message) => {
    console.log(`Received message on ${topic}: ${message.toString()}`);
    // Extract device ID from topic like "devices/device_123/data"
    const parts = topic.split('/');
    if (parts.length >= 3) {
        const deviceId = parts[1];
        
        try {
            const payload = JSON.parse(message.toString());
            
            // Translate to HTTP POST request to microservice
            console.log(`Forwarding data for ${deviceId} to REST API...`);
            await axios.post(`${REGISTRY_API_URL}/api/devices/${deviceId}/telemetry`, payload);
            console.log(`Successfully forwarded telemetry for ${deviceId}`);
            
        } catch (error) {
            console.error(`Error translating/forwarding data: ${error.message}`);
        }
    }
});

// API Endpoint to send commands to devices (REST -> MQTT)
app.post('/api/commands/:deviceId', (req, res) => {
    const { deviceId } = req.params;
    const commandPayload = req.body;
    
    // Publish MQTT message to specific device topic
    const topic = `devices/${deviceId}/commands`;
    client.publish(topic, JSON.stringify(commandPayload));
    
    console.log(`Published command to ${topic}`);
    res.json({ status: 'success', message: `Command sent to ${deviceId}` });
});

app.listen(PORT, () => {
    console.log(`Protocol Translator HTTP server listening on port ${PORT}`);
});
