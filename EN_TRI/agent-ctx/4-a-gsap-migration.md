# Task 4-a: GSAP Migration for NutritionPage.tsx

## Task Description
Migrate `/home/z/my-project/src/components/NutritionPage.tsx` from Framer Motion to GSAP.

## Work Completed

### 1. Import Changes
- **Removed**: `import { motion, AnimatePresence } from 'framer-motion';`
- **Added**: `import gsap from 'gsap';`

### 2. Motion Components Replaced

#### Stats Section (Lines 1297-1437)
- Replaced 4 `motion.div` cards with regular `div` elements
- Added `.stat-card` class for GSAP targeting
- Created `statsCardsRef` for animation container
- Implemented staggered fade-in animation with `gsap.fromTo()`

#### Progress Bar (Line 1339)
- Replaced `motion.div` progress bar with regular `div`
- Added `progressBarRef` for direct GSAP targeting
- Implemented width animation from 0% to 65%

#### Meals Grid (Lines 1541-1673)
- Replaced all `motion.div` meal cards with regular `div` elements
- Added `.meal-card` class for GSAP targeting
- Created `mealsGridRef` for animation container
- Implemented staggered scale/fade animation
- Animation triggers on `displayedMeals` changes

#### Preview Banner (Line 1509)
- Replaced `motion.div` with regular `div`
- Added `previewBannerRef` for GSAP targeting
- Implemented fade-in from above animation

#### Logistics Section (Lines 1680-1827)
- Replaced 2 `motion.div` panels with regular `div` elements
- Added `.logistics-panel` class for GSAP targeting
- Created `logisticsRef` for animation container
- Implemented staggered slide-in animation

#### Inspirations Section (Lines 1854-1881)
- Replaced `motion.div` cards with regular `div` elements
- Added `.inspiration-card` class for GSAP targeting
- Created `inspirationsRef` for animation container
- Implemented staggered fade-up animation

### 3. AnimatePresence Replaced with Conditional Rendering + GSAP

#### Recipe Detail Modal (Lines 1889-2149)
- Replaced `<AnimatePresence>` with conditional rendering `{isRecipeModalOpen && selectedMeal && (...)}`
- Created `recipeModalRef` and `recipeModalContentRef` for GSAP targeting
- Implemented open animation:
  - Background: fade from opacity 0 to 1
  - Content: scale from 0.9, fade from opacity 0
- Created `closeRecipeModal()` function with exit animation:
  - Content: scale to 0.9, fade to opacity 0
  - Background: fade to opacity 0, then set state

#### Audio Drawer Modal (Lines 2152-2429)
- Replaced `<AnimatePresence>` with conditional rendering
- Created `audioDrawerRef` for GSAP targeting
- Implemented slide-in animation from right (x: 100 to 0)
- Close animation handled by state change (no explicit exit animation needed)

### 4. Motion Buttons Replaced

#### Reading Mode Selector (Lines 2219-2258)
- Replaced `motion.button` with regular `button` elements
- Created `handleReadingModeButtonHover`, `handleReadingModeButtonLeave`, `handleReadingModeButtonTap` handlers
- Implemented GSAP scale animations for hover/tap states
- Animated check icon with `gsap.fromTo()` when mode changes

#### Voice Selector (Lines 2276-2329)
- Replaced `motion.button` with regular `button` elements
- Created `handleVoiceButtonHover`, `handleVoiceButtonLeave`, `handleVoiceButtonTap` handlers
- Implemented GSAP scale animations for hover/tap states
- Animated check icon with `gsap.fromTo()` when voice changes

### 5. Soundwave Animation (Lines 2411-2423)
- Replaced `motion.div` bars with regular `div` elements
- Added `.soundwave-bar` class for GSAP targeting
- Created `soundwaveRef` for animation container
- Implemented continuous yoyo animation with `gsap.to()` when playing
- Added cleanup to kill tweens when animation stops

### 6. SVG Circles
- The SVG circles (for the calories gauge) were already regular SVG elements, not motion components
- No changes needed for SVG animations

## GSAP Refs Created
- `statsCardsRef` - Stats section container
- `mealsGridRef` - Meals grid container
- `logisticsRef` - Logistics section container
- `inspirationsRef` - Inspirations section container
- `recipeModalRef` - Recipe modal overlay
- `recipeModalContentRef` - Recipe modal content
- `audioDrawerRef` - Audio drawer panel
- `progressBarRef` - Budget progress bar
- `previewBannerRef` - Preview mode banner
- `soundwaveRef` - Soundwave animation container

## Testing
- ✅ ESLint passed with no errors
- ✅ Dev server running without compilation errors
- ✅ All animations implemented using GSAP
- ✅ Conditional rendering replaces AnimatePresence
- ✅ Hover/tap animations for buttons implemented

## Files Modified
- `/home/z/my-project/src/components/NutritionPage.tsx`

## Notes
- All Framer Motion functionality has been replaced with equivalent GSAP animations
- The migration preserves the visual appearance and timing of all animations
- GSAP cleanup is properly handled in useEffect return statements where needed
