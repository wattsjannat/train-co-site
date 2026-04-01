# Welcome Journey Tools - Site Function Integration

## Overview

The welcome journey tools from Mobeus 2.0 have been integrated as a site function that the voice agent can call to get UI component data for the career onboarding flow.

## Implementation

### Site Function: `getWelcomeJourneyTool`

**Location**: `src/site-functions/getWelcomeJourneyTool.ts`

**Purpose**: Returns tool data for rendering welcome journey UI components in the Mobeus UIFramework.

### Tool Coverage

The function supports **19 different tools** across the welcome journey:

#### 1. Greeting & Exploration (2 tools)
- `2194-A` - Welcome greeting with 3 glassmorphic options
- `2194-B` - Tell me more about TrAIn (6 options)

#### 2. Industry Qualification (3 tools)
- `7483-A` - Industry selection (Technology, Finance, Healthcare, Construction)
- `7483-B` - Custom industry text input
- `7483-C` - Exploration path (for users unsure about industry)

#### 3. Role Qualification (7 tools)
- `4521-A` - Technology roles (Cybersecurity, AI, Digital Transformation, Data Science)
- `4521-B` - Finance roles (Investment, Accounting, Risk, Financial Planning)
- `4521-C` - Healthcare roles (Clinical, Administration, Pharmacy, Medical Devices)
- `4521-D` - Construction roles (Civil Engineering, Architecture, Project Management)
- `4521-E` - **Dynamic** custom industry roles (generates 4 roles based on custom industry)
- `4521-F` - Generic cross-industry roles (Leadership, Marketing, HR, Operations)
- `4521-G` - Custom role text input

#### 4. Interest Exploration (4 tools)
- `4521-H` - Technology interests
- `4521-I` - Finance interests
- `4521-J` - Healthcare interests
- `4521-K` - Construction interests

#### 5. Priorities (2 tools)
- `1657-A` - Priority selection (Browsing, Fit, Location, Skills, Courses)
- `1657-B` - Custom priority text input

#### 6. Registration (1 tool)
- `9183-A` - Registration form (LinkedIn + Email)

## Usage

### From Mobeus Agent

The agent calls this function via RPC:

```python
# Get greeting tool
result = call_site_function("getWelcomeJourneyTool", {"toolId": "2194-A"})

# Get dynamic custom industry roles
result = call_site_function("getWelcomeJourneyTool", {
    "toolId": "4521-E",
    "customIndustry": "Renewable Energy"
})
```

### Response Format

```json
{
  "success": true,
  "data": {
    "stepId": "3847-A",
    "toolId": "2194-A",
    "componentType": "GlassmorphicOptions",
    "options": "Yes, I'm ready|Not just yet|Tell me more",
    "badge": "MOBEUS CAREER",
    "title": "Welcome",
    "subtitle": "Getting started"
  }
}
```

## Component Types

The function returns data for 4 different UI component types:

1. **GlassmorphicOptions** - Bubble-style options for greeting
2. **MultiSelectOptions** - Multi-select checkboxes with Continue button
3. **TextInput** - Single text input field
4. **RegistrationForm** - LinkedIn + Email registration form

## Dynamic Role Generation

Tool `4521-E` dynamically generates 4 relevant roles based on the custom industry input.

**Supported Industries** (20+ predefined):
- Renewable Energy, Gaming, Agriculture, Fashion, Education
- Hospitality, Automotive, Aerospace, Media, Retail
- Logistics, Manufacturing, Real Estate, Legal, Consulting
- Nonprofit, Government, Telecommunications, Insurance, Pharmaceuticals

**Fallback**: For unknown industries, generates generic roles like "{Industry} Specialist", "{Industry} Management", etc.

## Progress Indicators

Tools at qualification steps include progress metadata:

```json
{
  "progress": {
    "progressStep": 0,
    "progressTotal": 3
  }
}
```

- Step 1 (Industry): progressStep=0
- Step 2 (Role): progressStep=1
- Step 3 (Priority): progressStep=2

## Journey Flow

```
Greeting (2194-A)
  ↓
Industry (7483-A)
  ↓
Role (4521-A/B/C/D/E/F)
  ↓
Interest (4521-H/I/J/K) [if "I'm not sure" selected]
  ↓
Priority (1657-A)
  ↓
Registration (9183-A)
```

## Error Handling

The function returns descriptive errors:

```json
{
  "success": false,
  "error": "Unknown tool ID: invalid-id"
}
```

```json
{
  "success": false,
  "error": "Missing customIndustry parameter for dynamic tool 4521-E"
}
```

## Testing

To test locally:

```javascript
// In browser console
window.__siteFunctions.getWelcomeJourneyTool({ toolId: "2194-A" })
// Returns greeting tool data

window.__siteFunctions.getWelcomeJourneyTool({ 
  toolId: "4521-E", 
  customIndustry: "Gaming" 
})
// Returns: Game Design|Game Development|Esports Management|Game Production|Something else|I'm not sure
```

## Deployment

1. The function is automatically registered on app initialization via `VoiceSessionProvider`
2. The agent receives the function metadata in the session dispatch
3. The agent can call the function at any point during the welcome journey

## Future Enhancements

- Add more industry-specific role mappings
- Support for localization (multi-language options)
- A/B testing different option sets
- Analytics tracking for option selection patterns
