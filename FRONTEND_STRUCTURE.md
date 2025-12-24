# Frontend Design Code Structure

This document explains where the frontend design/styling code is located in the FeatureValidate project.

## Main Frontend Design Files

### 🎨 Global Styles & Configuration

1. **`app/globals.css`**
   - Global CSS styles
   - Tailwind CSS imports
   - Custom utility classes (gradients, text effects)
   - Root CSS variables

2. **`tailwind.config.ts`**
   - Tailwind CSS configuration
   - Custom color schemes
   - Extended theme settings

### 📄 Page Components (Main UI)

3. **`app/page.tsx`**
   - Landing page design
   - Hero section with gradients
   - Feature cards layout
   - Main CTA button styling

4. **`app/new/page.tsx`**
   - Feature intake form page
   - Form container styling
   - Page layout and background

5. **`app/s/[id]/page.tsx`**
   - Results page design
   - Verdict display layout
   - Results container styling
   - Action buttons layout

6. **`app/layout.tsx`**
   - Root layout component
   - Font configuration (Inter)
   - Global HTML structure

### 🧩 Reusable UI Components

7. **`components/ui/Card.tsx`**
   - Card component styling
   - Glassmorphism effects
   - Hover animations
   - Shadow and border styles

8. **`components/ui/Badge.tsx`**
   - Badge/status indicator styling
   - Verdict badge gradients (BUILD/RISKY/DONT_BUILD)
   - Confidence level styling
   - Size variants

9. **`components/ui/Section.tsx`**
   - Section wrapper styling
   - Title and content spacing

10. **`components/ui/Spinner.tsx`**
    - Loading spinner animation
    - Size variants

### 📋 Feature-Specific Components

11. **`components/IntakeForm.tsx`**
    - Form input styling
    - Button gradients
    - Radio button styling
    - Input focus states
    - Label typography

12. **`components/VerdictView.tsx`**
    - Verdict display layout
    - Reasons card styling

13. **`components/PivotOptions.tsx`**
    - Pivot options card grid
    - Option card styling

14. **`components/TransparencyPanel.tsx`**
    - Accordion-style transparency panel
    - Expandable sections styling

15. **`components/SprintPlanView.tsx`**
    - Validation sprint plan layout
    - Test cards styling
    - Survey display
    - Outreach template cards

## Design System Overview

### Color Palette
- **Primary Gradients**: Purple → Blue → Cyan
- **Success**: Green → Emerald gradients
- **Warning**: Yellow → Orange gradients
- **Error**: Red → Rose gradients
- **Background**: Slate-50 → Blue-50 → Indigo-100 gradients

### Styling Approach
- **Tailwind CSS** for utility-first styling
- **CSS Gradients** for backgrounds and buttons
- **Glassmorphism** (backdrop-blur) for cards
- **Smooth Transitions** for hover effects
- **Responsive Design** with Tailwind breakpoints

### Key Design Patterns

1. **Gradient Backgrounds**: Used on all main pages
2. **Glassmorphism Cards**: Semi-transparent white with backdrop blur
3. **Gradient Buttons**: Multi-color gradients with hover effects
4. **Gradient Text**: Used for headings (bg-clip-text)
5. **Rounded Corners**: rounded-xl and rounded-2xl throughout
6. **Shadow Effects**: Enhanced shadows for depth
7. **Hover Animations**: Scale, translate, and shadow changes

## Quick Reference

- **Want to change colors?** → Check `tailwind.config.ts` and gradient classes
- **Want to change page backgrounds?** → Check `app/*/page.tsx` files
- **Want to change card styles?** → Check `components/ui/Card.tsx`
- **Want to change form styling?** → Check `components/IntakeForm.tsx`
- **Want to change badges?** → Check `components/ui/Badge.tsx`
- **Want to add global styles?** → Check `app/globals.css`

