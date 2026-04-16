from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional

app = FastAPI(title="Device Registry Microservice")

# In-memory database for simulation
devices_db: Dict[str, Dict[str, Any]] = {}

class DeviceRegistration(BaseModel):
    device_type: str
    firmware_version: str
    location: Optional[str] = None

class DeviceTelemetry(BaseModel):
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    status: Optional[str] = None

@app.get("/")
def read_root():
    return {"message": "Welcome to the Device Registry API"}

@app.post("/api/devices/{device_id}/register")
def register_device(device_id: str, device: DeviceRegistration):
    devices_db[device_id] = {
        "metadata": device.model_dump(),
        "state": {},
        "online": True
    }
    return {"status": "success", "message": f"Device {device_id} registered"}

@app.post("/api/devices/{device_id}/telemetry")
def update_telemetry(device_id: str, telemetry: DeviceTelemetry):
    if device_id not in devices_db:
        # Auto-register implied for testing purposes
        devices_db[device_id] = {"metadata": {}, "state": {}, "online": True}
        
    devices_db[device_id]["state"].update(telemetry.model_dump(exclude_unset=True))
    devices_db[device_id]["online"] = True
    
    return {"status": "success", "current_state": devices_db[device_id]["state"]}

@app.get("/api/devices/{device_id}/status")
def get_device_status(device_id: str):
    if device_id not in devices_db:
        raise HTTPException(status_code=404, detail="Device not found")
    return devices_db[device_id]

@app.get("/api/devices")
def list_devices():
    return devices_db
