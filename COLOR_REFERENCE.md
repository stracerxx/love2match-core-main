# Love2Match Color Reference

## Official Color Specifications

### Primary Colors

#### Background (Dark Navy)
- **HSL**: `222 20% 6%`
- **RGB**: `#0A0E17`
- **Usage**: Main page backgrounds
- **CSS Variable**: `--background`

#### Card Surface (Card Navy)
- **HSL**: `222 18% 12%`
- **RGB**: `#131B2A`
- **Usage**: Card backgrounds, surface layers
- **CSS Variable**: `--card`

#### Text (Off-White)
- **HSL**: `0 0% 97%`
- **RGB**: `#F7F7F7`
- **Usage**: Main text color
- **CSS Variable**: `--foreground`

### Accent Colors

#### Primary - Magenta/Pink ✨
- **HSL**: `323 100% 50%`
- **RGB**: `#FF00FF` (approximate, exact is `#FF00FF`)
- **Usage**: 
  - CTA buttons
  - Main headings
  - Active navigation
  - Primary interactive elements
- **CSS Variable**: `--primary`
- **Tailwind**: `bg-primary`, `text-primary`

#### Secondary - Cyan/Turquoise 🔵
- **HSL**: `190 100% 50%`
- **RGB**: `#00FFFF` (approximate, exact is `#00FFFF`)
- **Usage**:
  - Verified badges ✓
  - Trust indicators
  - Secondary accents
  - Status icons
- **CSS Variable**: `--accent` or `--cyan`
- **Tailwind**: `bg-cyan`, `text-cyan`
- **Badge Class**: `.badge-cyan`

#### Tertiary - Gold/Yellow ⭐
- **HSL**: `45 100% 51%`
- **RGB**: `#FFD700` (approximate)
- **Usage**:
  - Premium badges
  - VIP status
  - Achievement indicators
  - Wallet/currency elements
- **CSS Variable**: `--gold`
- **Tailwind**: `bg-gold`, `text-gold`
- **Badge Class**: `.badge-gold`

### Secondary Colors

#### Muted Background
- **HSL**: `222 18% 20%`
- **RGB**: `#1E2A40`
- **Usage**: Secondary surfaces, hover states
- **CSS Variable**: `--muted`

#### Muted Text
- **HSL**: `222 10% 60%`
- **RGB**: `#8899BB`
- **Usage**: Secondary text, disabled text
- **CSS Variable**: `--muted-foreground`

#### Border/Input
- **HSL**: `222 18% 20%`
- **RGB**: `#1E2A40`
- **Usage**: Borders, input fields
- **CSS Variable**: `--border`, `--input`

#### Destructive (Error)
- **HSL**: `0 84% 60%`
- **RGB**: `#FF6B6B`
- **Usage**: Error states, destructive actions
- **CSS Variable**: `--destructive`

## Gradient Combinations

### Gradient Primary (Magenta Blend)
```css
background: linear-gradient(135deg, hsl(323 100% 50%), hsl(323 100% 45%));
```
- **Usage**: Main buttons, CTAs
- **CSS Class**: `.gradient-primary`

### Gradient Secondary (Gold Blend)
```css
background: linear-gradient(135deg, hsl(45 100% 51%), hsl(45 100% 45%));
```
- **Usage**: Secondary CTAs, premium features
- **CSS Class**: `.gradient-secondary`

### Gradient Hero (Multi-Color Blend)
```css
background: linear-gradient(135deg, hsl(323 100% 50%), hsl(270 80% 50%), hsl(190 100% 50%));
```
- Colors: Magenta → Purple → Cyan
- **Usage**: Profile headers, hero sections
- **CSS Class**: `.gradient-hero`

## Shadow Specifications

### Card Shadow (Subtle)
```css
box-shadow: 0 8px 30px -8px hsl(323 100% 50% / 0.25);
```
- **Usage**: Card elevation
- **CSS Class**: `.shadow-card`

### Card Hover Shadow (Enhanced)
```css
box-shadow: 0 12px 40px -10px hsl(323 100% 50% / 0.35);
```
- **Usage**: Card hover state
- **CSS Class**: `.shadow-card-hover`

## Opacity Values

### Common Opacity Stops
- **Full Opacity**: `1` (100%)
- **High Opacity**: `0.9` (90%)
- **Medium Opacity**: `0.5` (50%)
- **Low Opacity**: `0.2` (20%)
- **Very Low Opacity**: `0.1` (10%)

### Usage Examples
```tsx
// Card with semi-transparent background
className="bg-card/95"        // 95% opacity

// Hover states
className="hover:bg-primary/80"  // 80% opacity on hover

// Subtle elements
className="text-muted/50"     // 50% opacity muted text

// Borders
className="border-border/50"  // 50% opacity borders
```

## Color Palette Quick Reference

| Purpose | HSL | RGB | Usage |
|---------|-----|-----|-------|
| Main Background | `222 20% 6%` | `#0A0E17` | Page background |
| Card Surface | `222 18% 12%` | `#131B2A` | Cards, surfaces |
| Text | `0 0% 97%` | `#F7F7F7` | Main text |
| Primary (Magenta) | `323 100% 50%` | `#FF00FF` | Buttons, headings |
| Cyan | `190 100% 50%` | `#00FFFF` | Verified, trust |
| Gold | `45 100% 51%` | `#FFD700` | Premium, special |
| Muted BG | `222 18% 20%` | `#1E2A40` | Secondary surface |
| Muted Text | `222 10% 60%` | `#8899BB` | Secondary text |
| Error | `0 84% 60%` | `#FF6B6B` | Errors, destructive |

## CSS Variables (Complete List)

```css
/* Backgrounds */
--background: 222 20% 6%;
--card: 222 18% 12%;
--popover: 222 18% 12%;

/* Text */
--foreground: 0 0% 97%;
--muted-foreground: 222 10% 60%;

/* Accents */
--primary: 323 100% 50%;
--accent: 190 100% 50%;
--cyan: 190 100% 50%;
--gold: 45 100% 51%;

/* States */
--destructive: 0 84% 60%;
--border: 222 18% 20%;
--input: 222 18% 20%;
--ring: 323 100% 50%;

/* Radius */
--radius: 1rem;

/* Gradients */
--gradient-primary: linear-gradient(135deg, hsl(323 100% 50%), hsl(323 100% 45%));
--gradient-secondary: linear-gradient(135deg, hsl(45 100% 51%), hsl(45 100% 45%));
--gradient-hero: linear-gradient(135deg, hsl(323 100% 50%), hsl(270 80% 50%), hsl(190 100% 50%));

/* Shadows */
--shadow-card: 0 8px 30px -8px hsl(323 100% 50% / 0.25);
--shadow-card-hover: 0 12px 40px -10px hsl(323 100% 50% / 0.35);

/* Transitions */
--transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

## Using Colors in Components

### Tailwind Class Examples

```tsx
// Text colors
<span className="text-primary">Magenta text</span>
<span className="text-cyan">Cyan text</span>
<span className="text-gold">Gold text</span>

// Background colors
<div className="bg-primary">Magenta background</div>
<div className="bg-cyan">Cyan background</div>
<div className="bg-gold">Gold background</div>

// Borders
<div className="border border-primary">Magenta border</div>
<div className="border-2 border-cyan">Cyan border</div>

// With opacity
<div className="bg-primary/80">80% opaque magenta</div>
<div className="text-cyan/60">60% opaque cyan text</div>

// Gradients
<div className="gradient-primary">Gradient primary</div>
<div className="gradient-secondary">Gradient secondary</div>
<div className="gradient-hero">Gradient hero</div>
```

## Design Tips

1. **Don't Overuse Accent Colors** - Use magenta for main CTAs, cyan for trust, gold for premium
2. **Maintain Contrast** - Ensure text is readable on all backgrounds
3. **Use Opacity** - Vary opacity for hierarchy (e.g., `bg-card/95` for subtle, `bg-card` for solid)
4. **Gradient Usage** - Hero gradients are best for large background areas
5. **Shadow Consistency** - Use `.shadow-card` and `.shadow-card-hover` for consistency

## Accessibility Notes

- Magenta on dark navy: Excellent contrast (WCAG AAA)
- Cyan on dark navy: Excellent contrast (WCAG AAA)
- Gold on dark navy: Excellent contrast (WCAG AAA)
- All text colors meet WCAG AA standards minimum
