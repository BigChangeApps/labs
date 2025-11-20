# Web Animation Best Practices & Guidelines

## Document Purpose
This is a comprehensive reference guide for creating high-quality web animations. Use this as a knowledge base for implementing animations in web applications. All principles, timing values, and easing functions provided here are production-tested and ready to use.

---

## Core Principles

### Principle 1: Natural Motion
- **Goal**: Make animations feel organic and physics-based
- **Implementation**: Use spring animations to mimic real-world physics
- **Avoid**: Instant value changes and linear transitions
- **Key Insight**: Animations should feel like living, breathing elements that respond naturally to user interaction

### Principle 2: Speed & Responsiveness
- **Target Duration**: Keep animations under 300ms for optimal perceived performance
- **Recommended Easing**: Use `ease-out` easing functions to start fast and slow at the end
- **User Perception**: Fast starts create the impression of quick response while maintaining visual smoothness
- **Exception**: Intentionally slow animations (like success celebrations) can exceed 300ms

### Principle 3: Purposeful Placement
- **When to Animate**: State changes, modals, enter/exit scenarios, user feedback
- **When NOT to Animate**: Keyboard-initiated actions that users perform hundreds of times daily
- **Reasoning**: Animations should enrich information flow, not slow down power users
- **Examples of Good Use**: Dropdown menus, modal dialogs, success states, page transitions

### Principle 4: Performance Requirements
- **Minimum Frame Rate**: 60 frames per second (60fps)
- **Animatable Properties**: Only animate `transform` and `opacity` properties
- **Why These Properties**: They trigger GPU-accelerated composite rendering only
- **Avoid Animating**: `width`, `height`, `padding`, `margin`, `top`, `left` (these trigger layout + paint + composite)
- **Technical Detail**: Layout and paint operations are expensive; composite-only animations are performant
- **Fallback Strategy**: Use hardware-accelerated CSS or Web Animation API when main thread is busy

### Principle 5: Interruptibility
- **Requirement**: All animations must be smoothly interruptible mid-sequence
- **User Experience**: Users should never feel locked into waiting for an animation to complete
- **CSS Transitions**: Naturally support interruption better than keyframe animations
- **Library Support**: Framer Motion provides built-in interruptible animation support
- **Implementation Tip**: Avoid animation libraries that lock the UI during playback

### Principle 6: Accessibility
- **Critical Requirement**: Always respect the `prefers-reduced-motion` media query
- **User Need**: Some users experience motion sickness or vestibular disorders from animations
- **Implementation**: Provide alternative animations or instant transitions for users with reduced motion preference
- **Code Example**:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Principle 7: Cohesive Design System
- **Consistency**: Match easing curves and durations across similar components
- **Design Language**: Animation timing should reinforce overall product personality
- **Process**: Requires iterative refinement and external perspective for validation
- **Documentation**: Maintain a shared easing/timing system in your design tokens

---

## Good vs Great: Critical Distinctions

### Origin Awareness
**Good Animation**: Elements appear from the center of the screen or fade in place

**Great Animation**: Elements animate from meaningful, contextually relevant locations
- Dropdowns should animate from their trigger button position
- Use `transform-origin` to set the correct starting point
- Example: `transform-origin: bottom center` for a dropdown below a button
- Creates spatial continuity and helps users understand UI relationships

### Easing Selection
**Good Animation**: Uses basic built-in curves like `ease-in`, `ease-out`, or `linear`

**Great Animation**: Uses carefully chosen custom easing curves
- Built-in CSS curves often feel generic and lack character
- Custom cubic-bezier curves add personality and energy
- **Recommended Tool**: easing.dev for exploring stronger alternatives
- Example: `cubic-bezier(0.34, 1.56, 0.64, 1)` creates energetic "bounce" feel

### Spring-Based Motion
**Good Animation**: Values change instantly or with linear interpolation

**Great Animation**: Uses spring physics for decorative elements
- Spring animations prevent artificial feel of immediate value changes
- Libraries like Framer Motion provide `useSpring` hook for automatic interpolation
- **Important Rule**: Use springs for decorative animations; functional UI should prioritize clarity
- Example use case: Cursor followers, decorative backgrounds, playful interactions

### Tool & Property Mastery
**Good Animation**: Animates obvious properties like `opacity` and `transform`

**Great Animation**: Leverages advanced CSS properties strategically
- Example: Tabs component using `clip-path` for smooth color transitions
- Creates harmonious, unified animations instead of multiple separate movements
- Requires deep knowledge of CSS properties and their animation potential

---

## Production-Ready Easing Curves

### Spring-like (Energetic)
```css
cubic-bezier(0.34, 1.56, 0.64, 1)
```
**Characteristics**:
- Slight overshoot creates energetic, playful feel
- Fast start with bounce at end
- High perceived responsiveness

**Best Use Cases**:
- Button interactions (hover, press)
- Card animations
- Success feedback and celebrations
- Micro-interactions
- Hover state transitions

**When to Avoid**:
- Large page transitions (overshoot feels excessive)
- Critical user actions (too playful)

### Smooth Ease-Out (Gentle)
```css
cubic-bezier(0.16, 1, 0.3, 1)
```
**Characteristics**:
- Very gentle deceleration
- Smooth, professional feel
- No overshoot or bounce
- Minimal perceived "settling time"

**Best Use Cases**:
- Modal and overlay entrances
- Page transitions and route changes
- Large element movements
- Drawer and sidebar animations
- Panel expansions

**When to Avoid**:
- Small, quick interactions (feels sluggish)
- Feedback that requires immediacy

### Fast Response (Snappy)
```css
cubic-bezier(0.4, 0, 0.2, 1)
```
**Characteristics**:
- Quick acceleration and deceleration
- Minimal animation "hang time"
- Feels immediate and responsive
- No bounce or overshoot

**Best Use Cases**:
- Loading spinners and progress indicators
- Quick state toggles
- Checkbox and radio button animations
- Icon transitions
- Tooltip appearances

**When to Avoid**:
- Large movements (feels too abrupt)
- Decorative or celebratory animations

---

## Timing Reference Table

| Element Type | Duration | Easing | Reasoning |
|--------------|----------|--------|-----------|
| Button hover | 200ms | Spring-like | Fast enough to feel responsive, bounce adds playfulness |
| Button press | 80-100ms | Fast response | Must feel instant; any longer feels laggy |
| Modal entrance | 250-300ms | Smooth ease-out | Large movement needs gentler easing |
| Slide transitions | 300ms | Spring-like | Bounce reinforces direction of movement |
| Success feedback | 600ms | Spring-like with overshoot | Celebration deserves emphasis and time |
| Micro-interactions | 150-200ms | Spring-like | Quick but noticeable; adds delight |
| Tooltip appear | 100ms | Fast response | Informational; shouldn't distract |
| Loading spinner | 150ms | Fast response | Continuous motion; ease matters less |
| Page transition | 300ms | Smooth ease-out | Large context change needs smooth feel |
| Dropdown menu | 200ms | Smooth ease-out | Predictable; avoid bounce in menus |

---

## Pre-Ship Animation Checklist

Before deploying any animation to production, verify ALL of the following:

- [ ] **Duration Check**: Animation completes in under 300ms (unless intentionally slow for emphasis)
- [ ] **Property Check**: Only animates `transform` and/or `opacity` (no layout-triggering properties)
- [ ] **Easing Check**: Uses custom cubic-bezier curve (no `linear` or default `ease`)
- [ ] **Accessibility Check**: Respects `prefers-reduced-motion` media query
- [ ] **Interruptibility Check**: User can interrupt animation smoothly (no UI locking)
- [ ] **Origin Check**: Animation originates from contextually meaningful location
- [ ] **Value Check**: Animation adds genuine value to UX (not animation for animation's sake)
- [ ] **Consistency Check**: Easing and duration match similar animations in your system
- [ ] **Performance Check**: Runs at 60fps on target devices (test on lower-end hardware)
- [ ] **Cross-browser Check**: Tested in Chrome, Firefox, Safari, and mobile browsers

---

## Tools & Resources

### Easing Curve Generators
- **easing.dev** - Interactive cubic-bezier curve generator with visual preview and presets
- **cubic-bezier.com** - Classic tool for creating and testing custom timing functions
- **easings.net** - Reference library of common easing functions with visualizations

### Animation Libraries

#### React Ecosystem
- **Framer Motion** (https://www.framer.com/motion/) - Declarative React animation library with spring physics, gesture support, and layout animations
- **React Spring** (https://www.react-spring.dev/) - Spring-physics based animation library for React with hooks API
- **Auto Animate** (https://auto-animate.formkit.com/) - Zero-config drop-in animations for React, Vue, and Svelte

#### Framework Agnostic
- **GSAP** (https://greensock.com/gsap/) - Industry-standard high-performance animation library, works everywhere
- **Motion One** (https://motion.dev/) - Modern, lightweight alternative to GSAP with smaller bundle size
- **Anime.js** (https://animejs.com/) - Lightweight JavaScript animation library with comprehensive API

### Performance Testing Tools
- **Chrome DevTools Performance Tab**: Record timeline and analyze frame rate, identify jank
- **Firefox DevTools Performance Monitor**: Real-time FPS counter and performance metrics
- **Browser Frame Rate Monitor**: Built-in FPS overlay (enable in browser dev settings)
- **Real Device Testing**: Always test on actual mid-range Android devices (often the performance bottleneck)
- **Reduced Motion Testing**: Enable `prefers-reduced-motion` in system settings to verify fallback behavior

---

## Common Animation Patterns (Copy-Paste Ready)

### Pattern 1: Fade In with Slight Scale
**Use Case**: Modal entrances, card appearances, content reveals

```css
.fade-in-scale {
  animation: fadeInScale 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Accessibility: respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .fade-in-scale {
    animation: none;
    opacity: 1;
    transform: scale(1);
  }
}
```

### Pattern 2: Button Press Feedback
**Use Case**: Any clickable button or interactive element

```css
.button {
  /* Smooth return to original state */
  transition: transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.button:active {
  /* Quick press down */
  transform: scale(0.95);
  transition-duration: 80ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .button {
    transition: none;
  }
}
```

### Pattern 3: Hover Lift with Shadow
**Use Case**: Cards, product tiles, interactive panels

```css
.card {
  transition:
    transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .card {
    transition: box-shadow 200ms ease;
  }
  .card:hover {
    transform: none;
  }
}
```

### Pattern 4: Slide In from Bottom
**Use Case**: Mobile drawers, bottom sheets, notifications

```css
.slide-up {
  animation: slideUp 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .slide-up {
    animation: fadeIn 150ms ease forwards;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
}
```

### Pattern 5: Stagger Children Animation
**Use Case**: List items, gallery grids, navigation menus

```css
.stagger-container > * {
  animation: fadeInUp 400ms cubic-bezier(0.16, 1, 0.3, 1) backwards;
}

.stagger-container > *:nth-child(1) { animation-delay: 0ms; }
.stagger-container > *:nth-child(2) { animation-delay: 50ms; }
.stagger-container > *:nth-child(3) { animation-delay: 100ms; }
.stagger-container > *:nth-child(4) { animation-delay: 150ms; }
.stagger-container > *:nth-child(5) { animation-delay: 200ms; }
/* Continue pattern as needed */

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .stagger-container > * {
    animation: none;
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Pattern 6: Loading Spinner
**Use Case**: Loading states, processing indicators

```css
.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-top-color: #000;
  border-radius: 50%;
  animation: spin 600ms linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Accessibility: slow down for reduced motion */
@media (prefers-reduced-motion: reduce) {
  .spinner {
    animation-duration: 1200ms;
  }
}
```

---

## Framer Motion Patterns

### Pattern 1: Basic Component Animation
```jsx
import { motion } from 'framer-motion';

function Card() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1] // Smooth ease-out
      }}
    >
      Card content
    </motion.div>
  );
}
```

### Pattern 2: Hover and Tap Animations
```jsx
<motion.button
  whileHover={{
    scale: 1.05,
    transition: { duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }
  }}
  whileTap={{
    scale: 0.95,
    transition: { duration: 0.08, ease: [0.4, 0, 0.2, 1] }
  }}
>
  Click me
</motion.button>
```

### Pattern 3: Stagger Children
```jsx
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

function List() {
  return (
    <motion.ul variants={container} initial="hidden" animate="show">
      {items.map(item => (
        <motion.li key={item.id} variants={item}>
          {item.text}
        </motion.li>
      ))}
    </motion.ul>
  );
}
```

### Pattern 4: Respect Reduced Motion
```jsx
import { useReducedMotion } from 'framer-motion';

function AnimatedComponent() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={{ x: 100 }}
      transition={{
        duration: shouldReduceMotion ? 0.01 : 0.3,
        ease: shouldReduceMotion ? 'linear' : [0.16, 1, 0.3, 1]
      }}
    />
  );
}
```

---

## Advanced Concepts

### CSS containment for Performance
Use `contain` property to isolate animation performance impact:

```css
.animated-card {
  contain: layout style paint;
  /* Now browser knows changes won't affect outside elements */
}
```

### will-change Hint (Use Sparingly)
Tell browser to optimize for upcoming animations:

```css
.will-animate-soon {
  will-change: transform, opacity;
}

/* Remove after animation completes to free resources */
.animation-complete {
  will-change: auto;
}
```

**Warning**: Overuse of `will-change` can hurt performance. Only use when profiling shows benefit.

### Layout Animations with FLIP Technique
**FLIP** = First, Last, Invert, Play

1. **First**: Record initial position
2. **Last**: Move element to final position instantly
3. **Invert**: Apply transform to make it appear in original position
4. **Play**: Animate transform back to 0

Libraries like Framer Motion handle this automatically with `layout` prop.

---

## Common Mistakes to Avoid

### Mistake 1: Animating Layout Properties
❌ **Bad**:
```css
.dropdown {
  transition: height 300ms;
  height: 0;
}
.dropdown.open {
  height: 200px;
}
```

✅ **Good**:
```css
.dropdown {
  transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
  transform: scaleY(0);
  transform-origin: top;
}
.dropdown.open {
  transform: scaleY(1);
}
```

### Mistake 2: Ignoring Reduced Motion
❌ **Bad**: No consideration for motion-sensitive users

✅ **Good**: Always provide reduced motion alternative

### Mistake 3: Over-animating
❌ **Bad**: Every single UI change has a 500ms animation

✅ **Good**: Reserve animations for meaningful state changes

### Mistake 4: Inconsistent Timing
❌ **Bad**: Every component uses random duration/easing

✅ **Good**: Establish and document standard timing tokens

### Mistake 5: Blocking Interactions
❌ **Bad**: User must wait for animation before next action

✅ **Good**: Animations are interruptible and don't lock UI

---

## Performance Debugging Checklist

If animations feel janky or slow:

1. **Check Frame Rate**: Open DevTools Performance tab, record, look for dropped frames
2. **Identify Expensive Operations**: Look for "Layout", "Paint", or "Recalculate Style" in timeline
3. **Verify Properties**: Ensure only `transform` and `opacity` are animating
4. **Check Paint Flashing**: Enable "Paint flashing" in DevTools to see repaints
5. **Test on Lower-End Devices**: Animation that's smooth on MacBook may jank on Android
6. **Simplify**: Remove parts of animation to isolate what's causing performance issues
7. **Check Bundle Size**: Large animation libraries can slow initial load

---

## Credits & Further Reading

### Essential Resources
- **Emil Kowalski's Animation Guides**
  - Great Animations: https://emilkowal.ski/ui/great-animations
  - Good vs Great Animations: https://emilkowal.ski/ui/good-vs-great-animations

---

## Usage Guidelines

### For AI/LLM Context
When using this document as context for AI-assisted development:
- Reference specific easing curves by name (e.g., "use the Spring-like easing")
- Cite timing guidelines from the reference table
- Request animations that follow the checklist
- Ask for accessibility-compliant implementations
- Specify which pattern best fits your use case

### For Human Developers
- Bookmark easing.dev for custom curve creation
- Copy-paste code patterns and adapt to your needs
- Test all animations with `prefers-reduced-motion` enabled
- Profile performance on target devices before shipping
- Maintain consistency across your application

---

## Contributing

This is a living document. Improvements welcome:
- Better easing curves for specific use cases
- Additional code patterns
- Performance optimization techniques
- Accessibility improvements
- Real-world case studies

---

## License

This guide is open source and freely available for use in any project. Share it, adapt it, and help create better web experiences for everyone.

---

*Curated from industry best practices, modern web animation principles, and production experience. Last updated: 2025-11-18*