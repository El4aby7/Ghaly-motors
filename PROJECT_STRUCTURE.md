# Ghaly Motors - Project Structure

## Directory Organization

```
ghaly-motors/
├── index.html                 # Homepage
├── inventory.html             # Inventory/Listing page
├── README.md                  # Documentation
├── validate_json.py          # JSON validation tool
│
├── assets/
│   ├── css/
│   │   └── styles.css        # Global CSS styles
│   │
│   ├── js/
│   │   ├── config.js         # Configuration & constants
│   │   ├── utils.js          # Utility functions
│   │   └── inventory.js      # Inventory page logic
│   │
│   ├── images/
│   │   ├── bmw-x3-2018/     # BMW X3 2018 images
│   │   ├── bmw-x6-2025/     # BMW X6 2025 images
│   │   ├── byd-f3-2022/     # BYD F3 2022 images
│   │   ├── land-rover-range-rover-2017/  # Land Rover images
│   │   └── mercedes-e200-2021/           # Mercedes images
│   │
│   └── data/
│       └── vehicles.json     # Vehicle data

```

## File Descriptions

### HTML Files
- **index.html** - Homepage with hero section, featured vehicles, and company info
- **inventory.html** - Full inventory listing with search, filters, and detailed vehicle modal

### JavaScript Files
- **config.js** - Centralized configuration including:
  - API endpoints
  - Storage keys
  - UI constants
  - Business configuration
  - Feature flags
  - Validation rules

- **utils.js** - Utility functions including:
  - Toast notifications
  - Currency formatting
  - Debounce/throttle
  - Local storage helpers
  - Validation functions
  - Dark mode toggle

- **inventory.js** - Main application logic including:
  - Vehicle loading and rendering
  - Search and filtering
  - Favorites management
  - Compare functionality
  - Modal management (test drive, contact, compare)
  - Event listeners

### CSS Files
- **styles.css** - Global styles including:
  - Material Symbols icon configuration
  - Base styles
  - Animations
  - Form styling
  - Toast notifications
  - Responsive design
  - Dark mode support

### Data Files
- **vehicles.json** - Vehicle database with:
  - Basic info (make, model, year, mileage, price)
  - Thumbnail image path
  - Multiple vehicle images
  - Tags and specifications

## How It All Works Together

### Script Loading Order
1. **Tailwind CDN** - CSS framework
2. **config.js** - Must load first for CONFIG object
3. **utils.js** - Depends on CONFIG object
4. **inventory.js** - Depends on both config.js and utils.js

### Data Flow
```
vehicles.json
    ↓
inventory.js (loadVehicles)
    ↓
renderVehicles() → Display cards
    ↓
User interaction → Modal management → Form submission
```

### Feature Dependencies
- **Favorites**: localStorage + utils.js (setLocalStorage/getLocalStorage)
- **Compare**: Array management + renderVehicles()
- **Search/Filter**: filterVehicles() + renderVehicles()
- **Modals**: createModal functions + form handling
- **Toast**: showToast() from utils.js

## CSS Architecture

### Class Structure
- **Tailwind Classes** - Used for responsive layout and utility styling
- **Custom CSS** - In styles.css for complex animations and custom effects
- **Component Classes** - Defined in Tailwind config for theme colors

### Responsive Breakpoints
- **Mobile-first** design approach
- Tailwind breakpoints: `sm`, `md`, `lg`, `xl`, `2xl`

### Dark Mode
- Automatically detects system preference
- Can be toggled with `toggleDarkMode()`
- Stored in localStorage as 'darkMode'

## Adding New Features

### To Add a New Vehicle:
1. Add entry to `assets/data/vehicles.json`
2. Create folder in `assets/images/` with images
3. Update image paths in JSON

### To Add a New Filter:
1. Add to `CONFIG.FILTERS` in `config.js`
2. Update `filterVehicles()` logic in `inventory.js`
3. Add filter button to `inventory.html`

### To Add a New Modal:
1. Create `createXxxModal()` function in `inventory.js`
2. Create `openXxxModal()` and `closeXxxModal()` functions
3. Add button with `onclick="openXxxModal()"`
4. Call `createXxxModal()` in initial setup

## Performance Tips

1. **Images** - Stored locally (no external dependencies)
2. **Caching** - Uses localStorage for favorites
3. **Debouncing** - Search input debounced (300ms)
4. **Lazy Loading** - Can be added for large image galleries
5. **Minification** - CSS/JS can be minified for production

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Dark mode support (CSS, localStorage)
- Web Share API with fallback to clipboard

## Deployment

### GitHub Pages
- All assets are relative paths (works with GitHub Pages)
- No build step required
- Just push to repository

### Local Testing
- No server required
- Open HTML files directly in browser
- Or use `python -m http.server` for better compatibility

## Future Enhancements

- [ ] Backend API integration
- [ ] User authentication
- [ ] Shopping cart functionality
- [ ] Payment processing
- [ ] Admin panel
- [ ] Email notifications
- [ ] Image optimization
- [ ] Service worker for offline support
