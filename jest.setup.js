import '@testing-library/jest-dom'

// Mock environment variables
process.env.FITBIT_ACCESS_TOKEN = 'mock-access-token'
process.env.FITBIT_CLIENT_ID = 'mock-client-id'
process.env.FITBIT_CLIENT_SECRET = 'mock-client-secret'
process.env.FITBIT_REDIRECT_URI = 'http://localhost:3000/api/auth/callback'