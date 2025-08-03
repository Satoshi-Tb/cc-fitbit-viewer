import '@testing-library/jest-dom'

// Mock environment variables
process.env.FITBIT_ACCESS_TOKEN = 'mock-access-token'
process.env.FITBIT_CLIENT_ID = 'mock-client-id'
process.env.FITBIT_CLIENT_SECRET = 'mock-client-secret'
process.env.FITBIT_REDIRECT_URI = 'http://localhost:3000/api/auth/callback'

// Mock Request and Response for Node.js environment
global.Request = class MockRequest {
  constructor(url, options = {}) {
    this.url = url
    this.method = options.method || 'GET'
    this.headers = options.headers || {}
    this.body = options.body || null
  }
}

global.Response = class MockResponse {
  constructor(body, options = {}) {
    this.body = body
    this.status = options.status || 200
    this.statusText = options.statusText || 'OK'
    this.headers = options.headers || {}
    this.ok = this.status >= 200 && this.status < 300
  }

  async json() {
    return typeof this.body === 'string' ? JSON.parse(this.body) : this.body
  }

  async text() {
    return typeof this.body === 'string' ? this.body : JSON.stringify(this.body)
  }
}