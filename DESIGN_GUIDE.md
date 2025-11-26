# Love2Match Design System - Usage Guide

## Color Usage

### When to Use Each Color

#### Primary (Magenta #FF00FF equivalent)
- Main CTA buttons ("Like", "Send", "Save")
- Page headings
- Active navigation items
- Primary action areas

#### Cyan (Turquoise #00D4FF equivalent)
- Verified badges ✓
- Trust indicators
- Status icons
- Secondary highlights

#### Gold (Yellow #FFC700 equivalent)
- Premium badges ("Plus", "Elite Creator")
- VIP status indicators
- Achievement badges
- Monetary/wallet elements

#### Neutral Colors
- Backgrounds: Dark navy (`222 20% 6%`)
- Surfaces: Card navy (`222 18% 12%`)
- Text: Off-white (`0 0% 97%`)
- Secondary Text: Gray (`222 10% 60%`)

## Component Examples

### Using Cyan Badge (Verified)
```tsx
<Badge className="badge-cyan">✓ Verified</Badge>
```

### Using Gold Badge (Premium)
```tsx
<Badge className="badge-gold">⭐ Plus</Badge>
```

### Using Gradient Button
```tsx
<Button className="gradient-primary text-white">
  <Heart className="mr-2 h-5 w-5" fill="currentColor" />
  Like
</Button>
```

### Using Hero Gradient (Profile Header)
```tsx
<div className="gradient-hero h-64 rounded-lg">
  {/* Content here */}
</div>
```

## Tailwind Utilities

### Background Colors
```tsx
// Dark backgrounds
className="bg-background"  // Main dark navy
className="bg-card"         // Card surfaces
className="bg-secondary"    // Secondary surface

// Accents
className="bg-primary"      // Magenta
className="bg-cyan"         // Turquoise
className="bg-gold"         // Yellow
className="bg-accent"       // Cyan (same as cyan)
```

### Text Colors
```tsx
className="text-primary"              // Magenta text
className="text-foreground"           // Main text (white)
className="text-muted-foreground"     // Secondary text (gray)
```

### Gradients
```tsx
className="gradient-primary"    // Magenta gradient
className="gradient-secondary"  // Gold gradient
className="gradient-hero"       // Multi-color blend
```

### Shadows
```tsx
className="shadow-card"         // Subtle card shadow
className="shadow-card-hover"   // Hover shadow
```

## Layout Patterns

### Header with Title and Action
```tsx
<div className="border-b border-border/50 bg-gradient-to-r from-background to-card p-4">
  <h1 className="text-3xl font-bold text-primary">Page Title</h1>
  <p className="text-sm text-muted-foreground mt-1">Subtitle</p>
</div>
```

### Card Grid Layout
```tsx
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {items.map((item) => (
    <Card key={item.id} className="shadow-card hover:shadow-card-hover">
      {/* Content */}
    </Card>
  ))}
</div>
```

### Hero Section with Overlay
```tsx
<div className="gradient-hero h-48 md:h-64 relative">
  <div className="absolute inset-0 flex items-center justify-between p-4">
    {/* Hero content */}
  </div>
</div>
```

## Navigation Styling

### Active Navigation Item
```tsx
className={cn(
  'flex flex-col items-center gap-1 transition-smooth',
  isActive ? 'text-primary' : 'text-muted-foreground'
)}
```

### Bottom Mobile Navigation
Already configured in `Layout.tsx` - no changes needed

## Typography Scale

```tsx
// Headings
className="text-3xl font-bold text-primary"    // Main page heading
className="text-2xl font-bold text-primary"    // Section heading
className="text-lg font-semibold text-foreground"  // Card title
className="text-sm font-medium text-foreground"    // Normal text
className="text-xs text-muted-foreground"         // Small text
```

## Responsive Design

The app is mobile-first with breakpoints at:
- `sm`: 640px
- `md`: 768px (main breakpoint for desktop layout)
- `lg`: 1024px

### Mobile-to-Desktop Pattern
```tsx
// Mobile first
<div className="p-4">
  {/* Mobile layout */}
</div>

// Add md breakpoint for desktop
<div className="md:ml-20 md:p-8">
  {/* Desktop with sidebar */}
</div>
```

## Special Features

### Gradient Text (if needed)
```tsx
<h1 className="bg-gradient-to-r from-primary via-purple-500 to-cyan bg-clip-text text-transparent">
  Gradient Text
</h1>
```

### Loading Animation
```tsx
<Loader2 className="h-12 w-12 animate-spin text-primary" />
```

### Transitions
```tsx
className="transition-smooth hover:shadow-lg"
```

## CSS Variables Reference

All colors use CSS custom properties defined in `src/index.css`:

```css
--background: 222 20% 6%;           /* Main background */
--foreground: 0 0% 97%;             /* Main text */
--card: 222 18% 12%;                /* Card surfaces */
--primary: 323 100% 50%;            /* Magenta */
--secondary: 222 18% 20%;           /* Secondary surface */
--muted: 222 18% 20%;               /* Muted backgrounds */
--muted-foreground: 222 10% 60%;    /* Muted text */
--accent: 190 100% 50%;             /* Cyan */
--cyan: 190 100% 50%;               /* Explicit cyan */
--gold: 45 100% 51%;                /* Gold/Yellow */
```

## Testing the Design

1. **Verify Dark Mode**: All pages should have dark background
2. **Check Accents**: Magenta buttons and text, cyan badges, gold premium badges
3. **Test Hover States**: Buttons and cards should respond to hover
4. **Mobile Responsive**: Test on mobile viewport (< 768px)
5. **Desktop Layout**: Verify sidebar appears on desktop (> 768px)

## Common Customizations

### To Change Primary Color
Edit `src/index.css` and update:
```css
--primary: 323 100% 50%;  /* Change this HSL value */
```

### To Add New Accent Color
1. Add to CSS variables in `src/index.css`
2. Add to Tailwind config in `tailwind.config.ts`
3. Use with `bg-{color}`, `text-{color}`, etc.

### To Adjust Dark Mode Intensity
Modify the background values in `src/index.css`:
```css
--background: 222 20% 6%;  /* Increase % for lighter, decrease for darker */
```
