import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  scenarios: {
    frontend: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '3m', target: 1000 }, // Ramp up to 1000 VUs over 3 minutes
        { duration: '5m', target: 1000 }, // Maintain 1000 VUs for 5 minutes
        { duration: '3m', target: 0 },    // Ramp down to 0 VUs over 3 minutes
      ],
      exec: 'frontendScenario', // Function to execute for frontend
    },
    backend: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '3m', target: 1000 }, // Ramp up to 1000 VUs over 3 minutes for the backend
        { duration: '5m', target: 1000 }, // Maintain 1000 VUs for 5 minutes
        { duration: '3m', target: 0 },    // Ramp down to 0 VUs over 3 minutes
      ],
      exec: 'backendScenario', // Function to execute for backend
    },
  },
  thresholds: {
    // Example threshold: 95% of HTTP requests should finish in under 500ms.
    http_req_duration: ['p(95)<500'],
  },
};

export function frontendScenario() {
  const frontendUrl = 'http://localhost:80'; // Replace with your frontend URL
  let res = http.get(frontendUrl);
  check(res, {
    'Frontend status is 200': (r) => r.status === 200,
  });
  sleep(5); // Simulate user think-time
}

export function backendScenario() {
  const backendUrl = 'http://localhost:5000/api/shorten'; // Replace with your backend URL

  // JSON payload to be sent in the request
  const payload = JSON.stringify({
    url: 'https://www.example.com',
  });

  // Send POST request to backend
  let res = http.post(backendUrl, payload, {
    headers: {
      'Content-Type': 'application/json', // Ensure correct Content-Type header
    },
  });

  // Check the response
  check(res, {
    'Backend status is 201': (r) => r.status === 201,
    'Response body is not empty': (r) => r.body !== '',
  });

  // console.log('Backend Response: ' + res.body);

  sleep(5); // Simulate user think-time
}
