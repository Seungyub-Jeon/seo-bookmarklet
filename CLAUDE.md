# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

줍줍분석기는 bookmarklet-based SEO diagnostic tool that analyzes webpage SEO elements with a single click. The tool provides instant feedback on meta tags, page structure, content quality, and other crucial SEO factors.

## Architecture

### Core Components
- **Bookmarklet**: Single JavaScript file that executes in the user's browser context
- **DOM Analyzer**: Parses webpage elements and extracts SEO-relevant data
- **Results Display**: Modal/overlay interface for presenting findings
- **Validation Engine**: Checks SEO elements against best practices

### Key Technical Decisions
- Pure JavaScript implementation (no external dependencies for core functionality)
- Browser-based execution (no server-side components in initial release)
- Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- Performance target: <2 seconds execution time

## Development Commands

Since this is a bookmarklet project without a build system yet, consider these approaches:

```bash
# Create the bookmarklet JavaScript file
touch 줍줍분석기.js

# Test the bookmarklet locally
# 1. Open an HTML test page
# 2. Add the bookmarklet as: javascript:(function(){/* minified code */})()
# 3. Test on various websites

# For development, serve locally
python3 -m http.server 8000  # or any static server
```

## SEO Check Implementation Priority

Based on the PRD, implement checks in this order:

### Phase 1: Core Functionality (This Week)
1. Meta Information (title, description, robots, canonical)
2. Page Structure (H1 presence, heading hierarchy)
3. Image Alt Text verification
4. Basic Link Analysis (internal/external count)

### Phase 2: Enhanced Features (Next Week)
1. Social Media Meta Tags (Open Graph, Twitter Cards)
2. Semantic HTML5 Elements
3. Mobile Responsiveness (viewport tag)
4. Language/Internationalization

### Phase 3: Advanced Features (Future)
1. Broken Link Detection (requires HTTP requests)
2. Performance Metrics (Lighthouse API integration)
3. Structured Data validation

## Critical Implementation Notes

### DOM Parsing Strategy
- Use `document.querySelector()` and `document.querySelectorAll()` for element selection
- Handle missing elements gracefully (null checks)
- Cache DOM queries to improve performance

### SEO Best Practices to Enforce
- Title tag: Flag if >60 characters or missing
- Meta description: Flag if >160 characters or missing
- H1: Exactly one per page
- Alt text: Required for all non-decorative images
- Canonical URL: Should be present and valid
- Viewport meta: Required for mobile optimization

### Results Presentation
- Use color coding: Green (pass), Yellow (warning), Red (fail)
- Group results by category (Meta, Structure, Links, etc.)
- Provide actionable recommendations for each issue
- Include quick fixes where applicable

### Security Considerations
- Never collect or transmit user data
- Execute only in the current page context
- Avoid modifying the page content (read-only analysis)
- Sanitize any displayed content to prevent XSS

## Testing Approach

Test the bookmarklet on:
1. Well-optimized pages (should show mostly green)
2. Pages with known SEO issues
3. Single-page applications (React, Vue, Angular)
4. Static HTML sites
5. Different languages and character sets

## Code Structure Recommendation

```javascript
// 줍줍분석기.js structure
(function() {
  'use strict';
  
  // Configuration
  const CONFIG = {
    titleMaxLength: 60,
    descriptionMaxLength: 160,
    // ... other thresholds
  };
  
  // Analyzers
  const MetaAnalyzer = { /* ... */ };
  const StructureAnalyzer = { /* ... */ };
  const LinkAnalyzer = { /* ... */ };
  const ImageAnalyzer = { /* ... */ };
  
  // Results Display
  const ResultsModal = { /* ... */ };
  
  // Main execution
  const analyze = () => { /* ... */ };
  
  // Initialize
  analyze();
})();
```

## Performance Optimization Tips
- Minimize DOM traversals by caching queries
- Use efficient selectors (ID > class > tag)
- Defer non-critical checks if needed
- Consider async/await for API calls (future features)
- Batch DOM reads to avoid reflows

## Browser Compatibility Notes
- Use ES5 syntax for maximum compatibility, or transpile ES6+
- Test CSS injection for results modal across browsers
- Handle vendor-specific prefixes if needed
- Ensure event listeners are properly attached/detached