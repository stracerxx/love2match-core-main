# Love2Match Visual Design Reference

## Design Inspiration
Based on your reference screenshots, the app now features a modern dark theme with vibrant, modern accents that create a premium dating app aesthetic.

## Visual Elements Breakdown

### 1. Header Pattern

Every page now includes a consistent header:

```
┌─────────────────────────────────────────┐
│ ▎ Page Title (in Magenta)               │
│   Subtitle or count (gray text)         │
│                        [Settings Button]│
└─────────────────────────────────────────┘
```

**Examples:**
- Discover: "Discover" + "1 of 11 profiles"
- Matches: "Matches" + "3 mutual matches"
- Profile: "My Profile" (with settings)
- Messages: "Messages" + "2 conversations"

### 2. Card Styling

Cards feature:
- Dark navy backgrounds
- Subtle magenta-tinted shadows
- Rounded corners (1rem)
- Enhanced hover effect with larger shadow
- Smooth transitions

```
┌────────────────────────┐
│ ┌──────────────────────┐│ ← Card with shadow
│ │   Content            ││
│ │   • Heading          ││
│ │   • Description      ││
│ │   • Action button    ││
│ │                      ││
│ └──────────────────────┘│
└────────────────────────┘
      Shadow grows on hover
```

### 3. Profile Card (Discover Page)

```
┌──────────────────────────────────────────┐
│                                          │
│        [Profile Image/Gradient]          │
│             (3:4 aspect)                 │
│                                          │
│  ↓ ↓ ↓ Gradient Overlay ↓ ↓ ↓           │
│                                          │
│  ┌──────────────────────────────────┐   │
│  │ Ella 32              [✓ Verified]│   │
│  │ 📍 Nashville, TN                  │   │
│  │ 🎨 Art Curator                    │   │
│  └──────────────────────────────────┘   │
│                                          │
│  Bio text here...                        │
│                                          │
│  [🏷️ Tag]  [🏷️ Tag]  [🏷️ Tag]         │
│                                          │
│  [✕ Pass]              [❤️ Like]       │
└──────────────────────────────────────────┘
   Profile count: 1 of 11
```

**Features:**
- Gradient overlay at bottom
- Name and age in white
- Location and badge
- Tags with secondary styling
- Two action buttons (Pass & Like)
- Like button uses gradient primary

### 4. Badge System

```
┌──────────────────┐
│ ✓ Verified       │  ← Cyan background
└──────────────────┘

┌──────────────────┐
│ ⭐ Plus           │  ← Gold background
└──────────────────┘

┌──────────────────┐
│ 👑 Elite Creator │  ← Gold background
└──────────────────┘

[Interest Tag]       ← Secondary background
```

### 5. Profile Hero Section

```
╔══════════════════════════════════════════╗
║                                          ║
║         [Gradient Background]            ║
║                                          ║
║    ┌────────────────┐                   ║
║    │      [Avatar]  │ Tehran Shane... ⭐║
║    │     (circular) │ Las Vegas        ║
║    │     (bordered) │                   ║
║    └────────────────┘ ⭐ Plus           ║
║                       👑 Elite Creator   ║
║                                          ║
╚══════════════════════════════════════════╝
         Profile Information Below
     (Edit, Save buttons in header)
```

### 6. Navigation

#### Mobile (Bottom):
```
═══════════════════════════════════════════════
│ 🧭      💬      🖼️      📅      💳      👤   │
│Discover Chat Gallery Events Wallet Profile │
═══════════════════════════════════════════════
         (Active item: Magenta)
```

#### Desktop (Sidebar):
```
┌──────────────────┐
│      ❤️          │  ← App logo
├──────────────────┤
│                  │
│      🧭          │
│      💬          │
│      🖼️         │
│      🎁          │
│                  │
├──────────────────┤
```

### 7. Match Card

```
┌────────────────────────────────┐
│ Ella                           │
│ ella@example.com               │
│                                │
│ [💬 Message]                  │
└────────────────────────────────┘
```

**Features:**
- Name and email displayed
- Message button with primary color
- Consistent card styling
- Hover shadow effect

### 8. Message Bubble

```
                          ┌─────────────────┐
                          │ Your message    │
                          │ here... 🎉      │
                          └─────────────────┘
                             12:34 PM

┌─────────────────────┐
│ Their message       │
│ here...             │
└─────────────────────┘
   12:30 PM
```

**Features:**
- Right-aligned for user messages
- Left-aligned for partner messages
- Gradient primary for user messages
- Secondary/muted for partner messages
- Timestamp below each message

### 9. Form Styling

```
┌────────────────────────────────────────┐
│ Label                                  │
│ ┌────────────────────────────────────┐ │
│ │ Input text...                      │ │
│ └────────────────────────────────────┘ │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ Bio                                    │
│ ┌────────────────────────────────────┐ │
│ │ Textarea text...                   │ │
│ │                                    │ │
│ │                                    │ │
│ └────────────────────────────────────┘ │
└────────────────────────────────────────┘

[✓ Save]          [Cancel]
```

### 10. Color Usage in Context

**Headings:**
- Page headings: **Magenta** (`text-primary`)
- Section titles: Magenta or white depending on context

**Text:**
- Primary text: Off-white (`text-foreground`)
- Secondary text: Gray (`text-muted-foreground`)

**Interactive:**
- Primary CTA: Magenta button with gradient
- Secondary CTA: Outlined button with border
- Links: Magenta text

**Status Indicators:**
- Verified: Cyan badge
- Premium: Gold badge
- Standard: Primary badge

## Color Application Examples

### Button States

```
Normal:
┌─────────────────┐
│ Like (Magenta)  │
└─────────────────┘

Hover:
┌─────────────────┐
│ Like (Brighter) │  ← Lighter magenta
└─────────────────┘

Disabled:
┌─────────────────┐
│ Like (Faded)    │  ← Muted text
└─────────────────┘
```

### Background Layers

```
Level 1 (Darkest): Dark Navy (#0A0E17) - Main background
Level 2: Card Navy (#131B2A) - Card surfaces
Level 3: Muted (#1E2A40) - Secondary surfaces
Level 4: Muted with opacity - Overlays and hover states
```

## Animation & Transitions

All interactive elements have smooth transitions:

```
Timing: 300ms cubic-bezier(0.4, 0, 0.2, 1)

Examples:
- Button hover: Color + shadow change
- Card hover: Shadow enhancement
- Navigation active: Color transition
- Form focus: Border color change
```

## Responsive Breakpoints

### Mobile (< 768px)
- Full-width cards
- Bottom navigation
- Optimized touch targets
- Large buttons
- Stacked layout

### Desktop (≥ 768px)
- Sidebar navigation
- Grid layouts
- Side-by-side conversations
- Wider content areas
- Multi-column displays

## Typography Hierarchy

```
h1: Page Title - 24-32px Bold Magenta
h2: Section Title - 20-24px Bold Magenta
h3: Card Title - 18-20px Semibold Foreground
p:  Body Text - 14-16px Regular Foreground
small: Helper Text - 12-14px Regular Muted

Example:
┌─────────────────────────────────────┐
│ Discover (h1, 32px, Magenta)       │
│ 1 of 11 profiles (small, gray)     │
│                                     │
│ ┌─────────────────────────────────┐│
│ │ Ella 32 (h3, 20px)              ││
│ │ Nashville, TN (p, 14px, gray)   ││
│ └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

## Spacing Standards

- Extra Large: 32px (sections)
- Large: 24px (major components)
- Medium: 16px (components)
- Small: 8px (elements)
- Extra Small: 4px (details)

## Visual Hierarchy

1. **Most Important**: Page headings (magenta, large)
2. **Important**: Action buttons (gradient primary)
3. **Secondary**: Form inputs, secondary buttons
4. **Supporting**: Helper text, timestamps
5. **Least Important**: Borders, dividers, muted elements

## Empty States

```
┌────────────────────────────────────┐
│                                    │
│           [Large Icon]             │
│             (gray)                 │
│                                    │
│   No matches yet                   │
│   (Magenta heading)                │
│                                    │
│   Keep discovering profiles        │
│   and liking people to get         │
│   matches.                         │
│   (Gray subtext)                   │
│                                    │
└────────────────────────────────────┘
```

## Loading States

```
     ⟳ 
 (Spinning)
  Magenta color
   Loading...
```

## Key Design Principles

1. **Dark First** - Less eye strain, premium feel
2. **Magenta Bold** - Draws attention to CTAs
3. **Cyan Trust** - Verified/trust indicators
4. **Gold Premium** - Special features
5. **White Text** - High contrast readability
6. **Rounded Corners** - Modern, friendly
7. **Consistent Spacing** - Clean layout
8. **Smooth Animations** - Professional feel

---

This visual reference should help you understand and extend the design system as you add more features!
