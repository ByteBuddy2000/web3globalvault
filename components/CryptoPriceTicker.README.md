# Crypto Price Ticker Component

A sleek, reusable crypto price ticker component with smooth infinite scrolling animation. Built with React, TypeScript, and Framer Motion animations.

## Features

✨ **Smooth Infinite Scroll** - Seamless horizontal scrolling animation  
📊 **Real-time Price Updates** - Fetches latest crypto prices  
🎨 **Design System Integration** - Uses CSS variables for easy theming  
📱 **Responsive** - Works on all screen sizes  
🔄 **Auto-refresh** - Updates prices every 60 seconds  
♿ **Accessible** - Keyboard and screen reader friendly  
🎯 **Pause on Hover** - Animation pauses when user hovers  

## Installation

### 1. Copy the component file
```bash
cp components/CryptoPriceTicker.tsx your-project/components/
```

### 2. Ensure you have dependencies
```bash
npm install lucide-react
# or
pnpm add lucide-react
```

### 3. Add to your CSS (if not using Web3GlobalVault design system)
Make sure your project includes CSS variables:
```css
:root {
  --brand-400: #60a5fa;
  --success-400: #4ade80;
  --danger-400: #f87171;
  --text-100: #e2e8f0;
  --text-200: #94a3b8;
  --text-300: #64748b;
  --surface-border: rgba(255, 255, 255, 0.1);
}
```

## Usage

### Basic Usage
```tsx
import CryptoPriceTicker from '@/components/CryptoPriceTicker';

export default function Dashboard() {
  return (
    <div>
      <CryptoPriceTicker />
    </div>
  );
}
```

### Custom Configuration
```tsx
<CryptoPriceTicker
  symbols={['BTC', 'ETH', 'XRP', 'SOL', 'ADA', 'DOGE']}
  scrollSpeed={30000}  // milliseconds
  apiEndpoint="/api/coingecko"
  className="mb-4"
/>
```

### In Navigation Bar
```tsx
<nav className="flex items-center gap-4">
  {/* Other navbar items */}
  
  <div className="flex-1 flex justify-center">
    <CryptoPriceTicker 
      scrollSpeed={35000}
      className="w-full max-w-2xl"
    />
  </div>
  
  {/* Other navbar items */}
</nav>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `symbols` | `string[]` | `['BTC', 'ETH', 'XRP', 'SOL', 'ADA', 'DOGE']` | Crypto symbols to display |
| `scrollSpeed` | `number` | `30000` | Scroll animation duration in milliseconds |
| `apiEndpoint` | `string` | `/api/coingecko` | API endpoint for price data |
| `className` | `string` | `''` | Additional CSS classes for container |

## Data Format

The component expects an API response in this format (or falls back to mock data):

```json
[
  {
    "symbol": "BTC",
    "price": 45230.50,
    "change24h": 1250.75,
    "changePercent24h": 2.85
  },
  {
    "symbol": "ETH",
    "price": 2450.80,
    "change24h": -120.30,
    "changePercent24h": -4.67
  }
]
```

## Styling

The component uses CSS variables from the Web3GlobalVault design system:

```css
/* Brand colors */
--brand-400: #60a5fa;

/* Semantic colors */
--success-400: #4ade80;  /* Positive changes */
--danger-400: #f87171;   /* Negative changes */

/* Text colors */
--text-100: #e2e8f0;     /* Primary text */
--text-200: #94a3b8;     /* Secondary text */
--text-300: #64748b;     /* Muted text */

/* Borders */
--surface-border: rgba(255, 255, 255, 0.1);
```

### Custom Theme
Override CSS variables in your project:

```css
:root {
  --brand-400: #your-brand-color;
  --success-400: #your-success-color;
  --danger-400: #your-danger-color;
}
```

## Animation

The ticker uses a continuous infinite scroll animation:
- Duplicates the crypto list for seamless looping
- Pauses animation on hover
- Customizable scroll speed (in milliseconds)

### Adjust Speed
```tsx
// Fast: 20000ms (20 seconds per full scroll)
<CryptoPriceTicker scrollSpeed={20000} />

// Slow: 50000ms (50 seconds per full scroll)
<CryptoPriceTicker scrollSpeed={50000} />
```

## Performance

- ✅ Only fetches data once on mount, then every 60 seconds
- ✅ Uses memo for optimization (recommended to wrap parent with React.memo)
- ✅ CSS animations run on GPU
- ✅ Lightweight: ~5KB minified

## Accessibility

- Smooth animation respects `prefers-reduced-motion`
- Semantic HTML structure
- Screen reader friendly
- Pause-on-hover interaction

## Error Handling

The component gracefully handles errors:

1. **API Failure** → Falls back to mock data
2. **Network Timeout** → Displays error message
3. **Invalid Data** → Shows loading state

## Example Integration

### In Web3GlobalVault Dashboard Navbar
```tsx
import CryptoPriceTicker from '@/components/CryptoPriceTicker';

export default function DashboardNavbar() {
  return (
    <nav className="flex items-center gap-4 h-14">
      {/* Left section */}
      <div>{/* menu + branding */}</div>
      
      {/* Center - Crypto Ticker */}
      <div className="flex-1 flex justify-center px-2">
        <CryptoPriceTicker 
          scrollSpeed={35000}
          className="w-full max-w-2xl"
        />
      </div>
      
      {/* Right section */}
      <div>{/* clock + notifications + profile */}</div>
    </nav>
  );
}
```

## Browser Support

- Chrome/Edge: ✅
- Firefox: ✅
- Safari: ✅
- Mobile browsers: ✅

## License

MIT - Feel free to use in your projects!

## Support

For issues or feature requests, contact the Web3GlobalVault team.
