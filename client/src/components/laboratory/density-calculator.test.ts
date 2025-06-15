import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the React Query client
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// Simple test to verify Jest configuration works
describe('Laboratory Component Tests', () => {
  it('should render without crashing', () => {
    const queryClient = createTestQueryClient();
    
    render(
      <QueryClientProvider client={queryClient}>
        <div>Laboratory Test Component</div>
      </QueryClientProvider>
    );
    
    expect(screen.getByText('Laboratory Test Component')).toBeInTheDocument();
  });
});