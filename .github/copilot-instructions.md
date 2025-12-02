# GitHub Copilot Instructions for Le Pilote du Danube Reader

## Project Overview
This is a Next.js 15 (App Router) static web application that presents Jules Verne's "Le Pilote du Danube" in modernized French with interactive word-by-word translation and pronunciation features.

## Core Architecture Principles

### 1. Text Processing & Content
- **Original Source**: Project Gutenberg (https://www.gutenberg.org/files/11484/11484-0.txt)
- **Modernization**: All 18 chapters must be rewritten in contemporary 2025 French while preserving:
  - Original story, suspense, and descriptions
  - Jules Verne's literary style and rhythm
  - Same approximate length (no summarization)
  - Period-appropriate names, places, and objects (do not modernize these)
- **Modernization Prompt Template**: When updating modernization logic, use:
  ```
  You are a literary editor expert in Jules Verne. Rewrite the following chapter in contemporary French (2025), keeping absolutely all the charm, suspense, descriptions, and Verne's style, but replace archaic words and turns of phrase with their modern equivalents. Keep almost exactly the same length. Never summarize. Do not modernize names, places, or period objects.
  
  Chapter {number} – {title}
  
  {original_text}
  ```

### 2. Image Generation Prompts
- **Style**: Realistic 19th century illustration mixed with steampunk aesthetic
- **Technical Specs**: 16:10 ratio, dramatic lighting, highly detailed, cinematic
- **Artist References**: In the style of Gustave Doré and Alphonse de Neuville
- **Format**: Prompts must be in English, extremely detailed
- **Storage**: All prompts stored in `data/image_prompts.json`
- **Images**: Stored in `public/images/` as `chapter1.png` through `chapter18.png`

### 3. Interactive Reading Features

#### Word Click Behavior
- Every word is clickable (wrapped in `<span className="word">`)
- On click triggers TWO actions:
  1. **Pronunciation**: Uses Web Speech API with best available French voice
  2. **Translation**: Shows Ukrainian translation in tooltip
- **Smart Punctuation Handling**: 
  - Separate punctuation from words (don't pronounce/translate commas, periods, etc.)
  - Use regex like: `/\b[\w''-]+\b/g` to identify words
  - Preserve original spacing and punctuation in display

#### Translation API
- **Provider**: MyMemory API (free, no key needed for moderate use)
- **Endpoint**: `https://api.mymemory.translated.net/get?q={WORD}&langpair=fr|uk`
- **Error Handling**: Always implement fallback for API failures
- **Caching**: Consider caching translations to reduce API calls

#### Pronunciation
- **API**: Web Speech API (`window.speechSynthesis`)
- **Language**: `fr-FR` (French)
- **Voice Selection**: Prefer highest quality French voice available
- **Implementation**: Force French voice selection, don't rely on browser default

### 4. Frontend Structure (Next.js 15 App Router)

#### Page Routing
- **Home** (`/`): Grid/list of all 18 chapters with titles and thumbnails
- **Chapter** (`/chapter/[number]`): Individual chapter reader
  - Large illustration at top
  - Modernized French text
  - Interactive word spans

#### Components
- `ChapterCard.tsx`: Chapter preview card for home page
- `ChapterReader.tsx`: Main reading interface with word interaction
- Handle word wrapping client-side to avoid SSR hydration issues

#### Styling
- **Framework**: Tailwind CSS
- **Typography**: Use readable fonts (Charter, Georgia, or similar serif for body text)
- **Color Scheme**: 
  - Dark/light mode support
  - Danube-blue accents (#0077BE or similar)
- **Responsive**: Mobile-first design
- **Tooltips**: Use floating-ui or pure CSS, positioned near clicked word

### 5. Python Scripts (One-Time Processing)

Located in `/scripts/`:

1. **download_book.py**: 
   - Downloads from Project Gutenberg
   - Removes header/footer metadata
   - Ensures UTF-8 encoding

2. **split_chapters.py**: 
   - Splits into exactly 18 chapters
   - Preserves exact original chapter titles
   - Outputs to `data/original_chapters.json`

3. **modernize_chapters.py**: 
   - Uses Google Gemini API (`google-generativeai` package)
   - Processes each chapter with the modernization prompt
   - Outputs to `data/modern_chapters.json`
   - Must include API key handling (environment variable)

4. **generate_image_prompts.py**: 
   - Creates 18 detailed image generation prompts
   - Outputs to `data/image_prompts.json`
   - Each prompt must be highly detailed and scene-specific

### 6. Deployment

#### Azure Static Web Apps
- **Target**: Free tier
- **Build**: Static export from Next.js (`output: 'export'` in next.config.js)
- **CI/CD**: GitHub Actions workflow in `.github/workflows/`
- **Workflow**: Triggers on push to main branch
- **Configuration**: 
  - Build command: `npm run build`
  - Output directory: `out/`

## Code Quality Standards

### TypeScript
- Use strict TypeScript typing
- Define interfaces in `src/lib/types.ts`
- No `any` types unless absolutely necessary

### React/Next.js
- Use React Server Components by default
- Mark as `'use client'` only when needed (e.g., for click handlers, speech API)
- Follow Next.js 15 App Router conventions
- Use async/await for data fetching

### Error Handling
- Always handle API failures gracefully
- Provide user feedback for errors
- Log errors for debugging

### Performance
- Optimize images (use Next.js Image component where possible)
- Lazy load chapters
- Cache translations when possible
- Minimize client-side JavaScript

## File Naming Conventions
- Components: PascalCase (e.g., `ChapterReader.tsx`)
- Pages: lowercase (e.g., `page.tsx`)
- Data files: snake_case (e.g., `modern_chapters.json`)
- Python scripts: snake_case (e.g., `modernize_chapters.py`)

## When Making Changes

### Adding Features
- Maintain the literary quality and reading experience
- Ensure mobile responsiveness
- Test pronunciation and translation features
- Keep dark/light mode compatibility

### Modifying Text Processing
- Always preserve the modernization prompt template
- Test with sample chapters before full regeneration
- Validate JSON output structure

### Updating UI/UX
- Maintain elegant, distraction-free reading experience
- Keep Danube-blue color theme
- Ensure accessibility (keyboard navigation, screen readers)
- Test tooltip positioning on different screen sizes

### API Changes
- Update error handling if APIs change
- Consider rate limiting and caching
- Document any new API keys needed

## Data Structure Reference

### modern_chapters.json
```json
[
  {
    "number": 1,
    "title": "Chapter Title",
    "text": "Modernized French text..."
  }
]
```

### image_prompts.json
```json
[
  {
    "chapter": 1,
    "title": "Chapter Title",
    "prompt": "Detailed English prompt for image generation..."
  }
]
```

## Dependencies to Maintain
- Next.js 15+
- React 18+
- Tailwind CSS
- TypeScript
- Python packages: `google-generativeai`, `requests`, `beautifulsoup4` (or similar)

## Testing Checklist
When making changes, verify:
- [ ] Word click triggers pronunciation
- [ ] Ukrainian translation appears correctly
- [ ] Punctuation is not pronounced/translated
- [ ] Images load correctly
- [ ] Dark/light mode works
- [ ] Mobile responsive
- [ ] Navigation between chapters works
- [ ] Static export builds successfully
- [ ] All 18 chapters are accessible

## Environment Variables Needed
```
GEMINI_API_KEY=your_google_gemini_api_key
```

## Common Update Scenarios

### Updating Chapter Content
1. Modify `scripts/modernize_chapters.py`
2. Regenerate `data/modern_chapters.json`
3. Commit updated JSON file

### Changing Translation Language
1. Update MyMemory API langpair parameter
2. Update UI text labels
3. Test with sample words

### Adding New Chapter Features
1. Update `ChapterReader.tsx`
2. Ensure client-side rendering for interactive features
3. Test across browsers (speech API support varies)

### Styling Updates
1. Modify Tailwind classes
2. Update `globals.css` for custom styles
3. Test both dark and light modes

---

**Remember**: This is a literary project. Prioritize reading experience, text quality, and respect for Jules Verne's original work.
