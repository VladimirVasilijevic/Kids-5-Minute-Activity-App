# SplashScreen Component

A modern, responsive loading screen component for the Ana Vaspitac app that displays during network calls and app initialization.

## Features

- 🌈 Beautiful gradient background with brand colors
- 🎨 Animated logo with pulse effect
- ⚡ Smooth fade-in/fade-out animations
- 🌐 Internationalized text support
- 📱 Fully responsive design
- 🔄 Optional spinning loader
- 💬 Custom message support
- 🎯 Centralized loading state management

## Usage

### Basic Usage

The SplashScreen component is automatically integrated into the app and can be controlled through the `LoadingService`.

```typescript
import { LoadingService } from '../services/loading.service';

constructor(private _loadingService: LoadingService) {}

// Show loading
this._loadingService.show();

// Hide loading
this._loadingService.hide();
```

### Advanced Usage

```typescript
// Show with custom message
this._loadingService.showWithMessage('Loading activities...');

// Show without spinner
this._loadingService.showWithMessage('Processing...', false);

// Show for specific duration
this._loadingService.showForDuration(2500, 'Quick loading...');

// Show during async operation
const result = await this._loadingService.showWhile(
  async () => {
    // Your async operation here
    const data = await fetchData();
    return data;
  },
  'Fetching data...'
);
```

## Component Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `isVisible` | `boolean` | `false` | Controls visibility of the splash screen |
| `message` | `string` | `''` | Custom message to display (overrides default subtitle) |
| `showSpinner` | `boolean` | `true` | Whether to show the spinning loader |

## Service Methods

### LoadingService

| Method | Parameters | Description |
|--------|------------|-------------|
| `show()` | None | Shows loading with default settings |
| `showWithMessage(message, showSpinner?)` | `string, boolean` | Shows loading with custom message |
| `hide()` | None | Hides the loading screen |
| `showForDuration(duration, message?)` | `number, string?` | Shows loading for specific duration |
| `showWhile(operation, message?)` | `Function, string?` | Shows loading during async operation |

## Styling

The component uses CSS custom properties for theming:

```scss
:root {
  --primary-green: #4caf50;
  --watermelon-pink: #ff6b9d;
}
```

### Responsive Breakpoints

- **Desktop**: Full-size logo and text
- **Tablet (768px)**: Medium-size elements
- **Mobile (480px)**: Compact layout

## Demo

Visit `/splash-demo` to see all loading scenarios in action and test the component functionality.

## Integration Examples

### In Services

```typescript
@Injectable({ providedIn: 'root' })
export class DataService {
  constructor(private _loadingService: LoadingService) {}

  async fetchData(): Promise<any> {
    return this._loadingService.showWhile(
      async () => {
        const response = await this.http.get('/api/data').toPromise();
        return response;
      },
      'Loading data...'
    );
  }
}
```

### In Components

```typescript
@Component({...})
export class MyComponent {
  constructor(private _loadingService: LoadingService) {}

  async handleSubmit(): Promise<void> {
    try {
      await this._loadingService.showWhile(
        async () => {
          await this.saveData();
        },
        'Saving your data...'
      );
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }
}
```

## Accessibility

- High contrast colors for better visibility
- Proper ARIA labels and alt text
- Keyboard navigation support
- Screen reader friendly

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Dependencies

- Angular 15+
- RxJS
- @ngx-translate/core 