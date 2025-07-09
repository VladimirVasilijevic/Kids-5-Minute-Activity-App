import { TestBed } from '@angular/core/testing';
import { LoadingService, LoadingState } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have initial state with loading hidden', () => {
    const initialState = service.currentState;
    expect(initialState.isVisible).toBe(false);
    expect(initialState.message).toBe('');
    expect(initialState.showSpinner).toBe(true);
  });

  it('should show loading with default settings', () => {
    service.show();
    
    const state = service.currentState;
    expect(state.isVisible).toBe(true);
    expect(state.message).toBe('');
    expect(state.showSpinner).toBe(true);
  });

  it('should show loading with custom message', () => {
    const message = 'Loading activities...';
    service.showWithMessage(message);
    
    const state = service.currentState;
    expect(state.isVisible).toBe(true);
    expect(state.message).toBe(message);
    expect(state.showSpinner).toBe(true);
  });

  it('should show loading with custom message and spinner disabled', () => {
    const message = 'Processing...';
    service.showWithMessage(message, false);
    
    const state = service.currentState;
    expect(state.isVisible).toBe(true);
    expect(state.message).toBe(message);
    expect(state.showSpinner).toBe(false);
  });

  it('should hide loading', () => {
    service.show();
    expect(service.currentState.isVisible).toBe(true);
    
    service.hide();
    expect(service.currentState.isVisible).toBe(false);
  });

  it('should emit state changes through observable', (done) => {
    const expectedState: LoadingState = {
      isVisible: true,
      message: 'Test message',
      showSpinner: true
    };

    service.loadingState$.subscribe(state => {
      expect(state).toEqual(expectedState);
      done();
    });

    service.showWithMessage('Test message');
  });

  it('should show loading for specific duration', (done) => {
    const duration = 100;
    const message = 'Temporary loading';
    
    service.showForDuration(duration, message);
    
    // Should be visible immediately
    expect(service.currentState.isVisible).toBe(true);
    expect(service.currentState.message).toBe(message);
    
    // Should be hidden after duration
    setTimeout(() => {
      expect(service.currentState.isVisible).toBe(false);
      done();
    }, duration + 10);
  });

  it('should show loading while executing async operation', async () => {
    const message = 'Processing data...';
    let operationExecuted = false;
    
    const operation = async (): Promise<string> => {
      operationExecuted = true;
      await new Promise(resolve => setTimeout(resolve, 50));
      return 'result';
    };

    const result = await service.showWhile(operation, message);
    
    expect(result).toBe('result');
    expect(operationExecuted).toBe(true);
    expect(service.currentState.isVisible).toBe(false);
  });

  it('should hide loading even if async operation throws error', async () => {
    const message = 'Processing data...';
    
    const operation = async (): Promise<never> => {
      await new Promise(resolve => setTimeout(resolve, 50));
      throw new Error('Test error');
    };

    try {
      await service.showWhile(operation, message);
    } catch (error) {
      expect((error as Error).message).toBe('Test error');
    }
    
    expect(service.currentState.isVisible).toBe(false);
  });

  it('should handle multiple rapid show/hide calls', () => {
    service.show();
    service.hide();
    service.show();
    
    expect(service.currentState.isVisible).toBe(true);
    
    service.hide();
    expect(service.currentState.isVisible).toBe(false);
  });

  it('should maintain state consistency across multiple subscribers', (done) => {
    let subscriber1Called = false;
    let subscriber2Called = false;
    
    service.loadingState$.subscribe(state => {
      subscriber1Called = true;
      expect(state.isVisible).toBe(true);
    });
    
    service.loadingState$.subscribe(state => {
      subscriber2Called = true;
      expect(state.isVisible).toBe(true);
    });
    
    service.show();
    
    setTimeout(() => {
      expect(subscriber1Called).toBe(true);
      expect(subscriber2Called).toBe(true);
      done();
    }, 10);
  });
}); 