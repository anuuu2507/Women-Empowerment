import urllib.request
import json
import time

BASE_URL = "http://localhost:5000/api"

def make_request(url, method='GET', data=None):
    headers = {'Content-Type': 'application/json'}
    if data:
        data = json.dumps(data).encode('utf-8')
    
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            return response.getcode(), json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode('utf-8'))

def run_verification():
    # 1. Create Job
    print("1. Creating Job...")
    job_data = {
        "title": "Verification Job",
        "description": "Test Description",
        "category": "Other",
        "amount": {"min": 100, "max": 200},
        "location": "Test Loc",
        "deliveryType": "pickup",
        "urgency": "today",
        "customerName": "Test Customer",
        "postedAt": "fake_time",
        "creatorId": "customer_1"
    }
    
    code, res_data = make_request(f"{BASE_URL}/jobs", 'POST', job_data)
    if code not in [200, 201]:
        print(f"Failed to create job: {res_data}")
        return
        
    job = res_data['job']
    job_id = job['id']
    print(f"Job Created: {job_id}")
    print(f"Posted At (Server): {job['postedAt']}")
    
    # 2. Apply (Request)
    print("\n2. Applying (Requesting)...")
    code, res_data = make_request(f"{BASE_URL}/jobs/{job_id}/apply", 'POST', {"workerId": "worker_1"})
    print(f"Apply Status: {code}")
    print(f"Apply Response: {res_data}")
    
    application = res_data.get('application')
    if not application:
        print("No application returned!")
        return
        
    app_id = application['id']
    print(f"Application ID: {app_id}, Status: {application['status']}")
    
    if application['status'] != 'pending':
        print("ERROR: Application status should be pending!")
    else:
        print("SUCCESS: Application is pending.")
    
    # 3. Accept Application
    print("\n3. Accepting Application...")
    code, res_data = make_request(f"{BASE_URL}/applications/{app_id}/accept", 'POST', {})
    print(f"Accept Status: {code}")
    
    # 4. Verify Job Locked
    print("\n4. Verifying Job Status...")
    code, res_data = make_request(f"{BASE_URL}/jobs/{job_id}", 'GET')
    final_job = res_data['job']
    print(f"Final Job Status: {final_job['status']}")
    print(f"Assigned Worker: {final_job['worker_id']}")
    
    if final_job['status'] in ['locked', 'accepted'] and final_job['worker_id'] == 'worker_1':
        print("\nSUCCESS: Flow Verified!")
    else:
        print("\nFAILURE: Job not locked or assigned correctly.")

if __name__ == "__main__":
    try:
        run_verification()
    except Exception as e:
        print(f"Error: {e}")
