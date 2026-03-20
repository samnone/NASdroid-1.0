export const API_BASE_URL = window.location.origin.includes('localhost') || window.location.origin.includes('run.app')
  ? '' // Use relative paths in dev/web
  : 'http://localhost:8080'; // Default port for the native Android server (Ktor)
