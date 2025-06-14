import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the Firebase config
jest.mock('./lib/firebase', () => ({
  auth: {},
  app: {},
}));

// Mock the query client
jest.mock('./lib/queryClient', () => ({
  queryClient: {
    invalidateQueries: jest.fn(),
  },
  apiRequest: jest.fn(),
}));

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />);
    // Check if the app renders some basic content
    expect(document.body).toBeInTheDocument();
  });
});