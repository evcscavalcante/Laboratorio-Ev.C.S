import '@testing-library/jest-dom';
import 'jest-axe/extend-expect';

// Mock Firebase
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({})),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  signInWithRedirect: jest.fn(),
  getRedirectResult: jest.fn(() => Promise.resolve(null)),
  GoogleAuthProvider: jest.fn(() => ({})),
  onAuthStateChanged: jest.fn(),
}));

// Mock environment variables
process.env.VITE_FIREBASE_API_KEY = 'mock-api-key';
process.env.VITE_FIREBASE_PROJECT_ID = 'mock-project-id';
process.env.VITE_FIREBASE_APP_ID = 'mock-app-id';

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});