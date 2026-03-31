# Components Copied from trainco-v1

This document lists all components that were successfully copied from `/Users/jannatwatts/trainco-v1` to this project.

## Card Components

Located in `src/components/cards/`:

### 1. GlassmorphicCard
- **File**: `GlassmorphicCard.tsx`
- **Purpose**: Reusable glassmorphic card wrapper with slide-up animation
- **Features**:
  - Slide-up entrance animation
  - Handle bar for drag interactions
  - Glass morphism styling
  - Border and backdrop blur effects

### 2. GlassmorphicJobCard
- **File**: `GlassmorphicJobCard.tsx`
- **Purpose**: Job listing card with glassmorphic styling
- **Features**:
  - Company logo or initials avatar
  - Job title and company name
  - Salary range with Saudi Riyal icon
  - Location with map pin icon
  - Match score display
  - Fit category badge
  - Highlighted state support

## Chart Components

Located in `src/components/charts/`:

### 1. CircularGauge
- **File**: `CircularGauge.tsx`
- **Purpose**: SVG donut-ring gauge for percentage display
- **Features**:
  - Configurable size
  - Color-coded by percentage (green ≥75%, amber <75%)
  - Velocity mode with stacked chevrons
  - Smooth transitions

### 2. DotPlot
- **File**: `DotPlot.tsx`
- **Purpose**: Horizontal dot plot for skill levels
- **Features**:
  - Filled dots for current level
  - Bordered dots for target gap
  - Empty dots for remaining slots
  - Optional value display
  - Label truncation

### 3. LevelMeter
- **File**: `LevelMeter.tsx`
- **Purpose**: Horizontal segmented progress bar
- **Features**:
  - Configurable segments (default 5)
  - Current level highlighting
  - Target level indication
  - Green or blue variant
  - Customizable height and gap

### 4. PathTrack
- **File**: `PathTrack.tsx`
- **Purpose**: Career path progress visualization
- **Features**:
  - Progress bar with gradient
  - Optional labeled stops/milestones
  - Status indicators (completed/current/upcoming)
  - From/to labels
  - TrendingUp icon

### 5. ProgressBar
- **File**: `ProgressBar.tsx`
- **Purpose**: Simple horizontal progress bar
- **Features**:
  - Percentage-based width
  - Custom color support
  - Configurable height and radius
  - Smooth transitions

### 6. SkillGroup
- **File**: `SkillGroup.tsx`
- **Purpose**: Group of skill progression indicators
- **Features**:
  - Optional group label
  - Multiple DotPlot instances
  - Current and target levels
  - Skill name display

### 7. TrendLine
- **File**: `TrendLine.tsx`
- **Purpose**: SVG sparkline for trend data
- **Features**:
  - Polyline with gradient fill
  - 6-month trend support
  - Optional month labels
  - Auto-scaling to data range
  - Customizable color and height

## Exports

All components are exported from their respective index files:

- `src/components/cards/index.ts` - exports card components
- `src/components/charts/index.ts` - exports chart components

## Usage Examples

### GlassmorphicJobCard
```tsx
import { GlassmorphicJobCard } from '@/components/cards';

<GlassmorphicJobCard
  job={{
    id: "1",
    title: "Senior Developer",
    company: "Tech Corp",
    salaryRange: "15,000 - 20,000",
    location: "Riyadh",
    matchScore: 85,
    fitCategory: "excellent"
  }}
  isHighlighted={false}
  companyAvatar="logo"
/>
```

### CircularGauge
```tsx
import { CircularGauge } from '@/components/charts';

<CircularGauge percentage={84} size={98} />
<CircularGauge /> {/* Velocity mode */}
```

### PathTrack
```tsx
import { PathTrack } from '@/components/charts';

<PathTrack
  label="Career Path"
  percentage={60}
  stops={[
    { label: "Junior", status: "completed" },
    { label: "Mid-level", status: "current" },
    { label: "Senior", status: "upcoming" }
  ]}
/>
```

## Integration Status

✅ All components copied successfully
✅ TypeScript compilation passes
✅ All exports configured
✅ No dependency conflicts

## Next Steps

To use these components in the DSL card system:

1. Create card wrappers that follow the DSL card pattern
2. Add to `CARD_MAP` in `GridView.tsx`
3. Add to `CARD_SIZE` in `GridView.tsx`
4. Add DSL parsing support in `parseDSL.ts`

Refer to `/Users/jannatwatts/Downloads/create-tele-component.md` for the integration workflow.
