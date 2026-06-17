import requests
import json

# Test the backend server
base_url = "http://127.0.0.1:5000"

print("Testing Backend Server...")
print("=" * 50)

# Test 1: Health check
print("\n1. Testing Health Endpoint...")
try:
    response = requests.get(f"{base_url}/api/health")
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}")
except Exception as e:
    print(f"   Error: {e}")

# Test 2: Register a new user
print("\n2. Testing Registration Endpoint...")
test_user = {
    "name": "Test User",
    "email": "testuser123@example.com",
    "phone": "+91 9876543210",
    "address": "Test Address, Hyderabad",
    "aadhaarLast4": "5678",
    "gender": "female"
}

try:
    response = requests.post(
        f"{base_url}/api/register",
        headers={"Content-Type": "application/json"},
        data=json.dumps(test_user)
    )
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.text[:500]}")
    if response.status_code == 200:
        print(f"   JSON: {response.json()}")
except Exception as e:
    print(f"   Error: {e}")

print("\n" + "=" * 50)
print("Test Complete!")
