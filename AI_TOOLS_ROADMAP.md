# PureTools AI - AI Tools Roadmap & Inventory

> **Last Updated:** 2026-01-22
> **Status:** Active Development
> **Total AI Tools:** 3 (expanding to 10+)

---

## Current AI Tools Inventory

### ✅ Implemented Tools

| Tool | Model | API | Credits | Status |
|------|-------|-----|---------|--------|
| AI Text Summarizer | Gemini 1.5 Flash | `/api/ai/summarize` | 0.3/1000 words | ✅ Live |
| AI Document Translator | Gemini 1.5 Flash | `/api/ai/translate` | 0.5/1000 words | ✅ Live |
| AI Audio Transcriber | OpenAI Whisper | `/api/ai/transcribe` | 1/minute | ✅ Live |
| AI Image Generator | OpenAI DALL-E 3 | `/api/ai/generate-image` | 5-10/image | ✅ Live |
| AI Voice Generator | OpenAI TTS | `/api/ai/tts` | 2-4/1000 chars | ✅ Live |

### 🚧 In Development

| Tool | Model | API | Est. Credits | Priority |
|------|-------|-----|--------------|----------|
| AI Video Generator | OpenAI Sora | `/api/ai/generate-video` | 50/video | HIGH (API not public) |
| AI Code Assistant | Gemini 1.5 Pro | `/api/ai/code-assist` | 1/request | HIGH |
| AI Grammar Checker | Gemini 1.5 Flash | `/api/ai/grammar` | 1/1000 words | HIGH |

### 📋 Planned Tools

| Tool | Model Options | Use Case | Priority |
|------|---------------|----------|----------|
| AI Image Upscaler | Real-ESRGAN / Stable Diffusion | Enhance low-res images | MEDIUM |
| AI Background Generator | DALL-E 3 | Create custom backgrounds | MEDIUM |
| AI Logo Generator | DALL-E 3 + Gemini | Generate brand logos | MEDIUM |
| AI Voice Cloning | ElevenLabs | Clone voices from samples | LOW |
| AI Music Generator | Suno / Udio API | Generate music from text | LOW |
| AI Chatbot Builder | Gemini Pro | Custom chatbot creation | LOW |
| AI Resume Builder | Gemini + Templates | Auto-generate resumes | MEDIUM |
| AI Email Writer | Gemini 1.5 Flash | Professional email drafts | MEDIUM |
| AI SEO Optimizer | Gemini + Analysis | Optimize content for SEO | MEDIUM |
| AI Grammar Checker | Gemini 1.5 Flash | Fix grammar & style | HIGH |
| AI Plagiarism Checker | Custom + Gemini | Detect copied content | MEDIUM |
| AI Paraphraser | Gemini 1.5 Flash | Rewrite text differently | HIGH |
| AI Hashtag Generator | Gemini 1.5 Flash | Social media hashtags | LOW |
| AI Caption Generator | Gemini Vision | Image descriptions | MEDIUM |

---

## Implementation Details

### Text-to-Image Generator (DALL-E 3)

```yaml
Endpoint: /api/ai/generate-image
Model: dall-e-3
Input:
  - prompt: string (max 4000 chars)
  - size: "1024x1024" | "1792x1024" | "1024x1792"
  - quality: "standard" | "hd"
  - style: "vivid" | "natural"
Output:
  - imageUrl: string (temporary URL)
  - revisedPrompt: string
Credits:
  - Standard: 5 credits
  - HD: 8 credits
Rate Limit: 5 images/minute
```

### Text-to-Video Generator (Sora)

```yaml
Endpoint: /api/ai/generate-video
Model: sora (when available)
Input:
  - prompt: string (max 1000 chars)
  - duration: 5 | 10 | 15 | 20 seconds
  - aspectRatio: "16:9" | "9:16" | "1:1"
  - style: "cinematic" | "animated" | "realistic"
Output:
  - videoUrl: string (temporary URL)
  - thumbnailUrl: string
  - duration: number
Credits:
  - 5 sec: 25 credits
  - 10 sec: 40 credits
  - 15 sec: 55 credits
  - 20 sec: 70 credits
Rate Limit: 2 videos/hour
Note: Sora API not yet public - prepare integration structure
```

### AI Code Assistant

```yaml
Endpoint: /api/ai/code-assist
Model: gemini-1.5-pro
Features:
  - Code explanation
  - Bug fixing suggestions
  - Code optimization
  - Language conversion
  - Documentation generation
Input:
  - code: string
  - language: string
  - action: "explain" | "fix" | "optimize" | "convert" | "document"
  - targetLanguage?: string (for conversion)
Output:
  - result: string
  - suggestions?: string[]
Credits: 1 credit per request
Rate Limit: 20 requests/minute
```

---

## API Models & Pricing Reference

### OpenAI Models

| Model | Use Case | Cost per Unit |
|-------|----------|---------------|
| DALL-E 3 Standard | Image Gen 1024x1024 | $0.040/image |
| DALL-E 3 HD | Image Gen 1024x1024 | $0.080/image |
| DALL-E 3 HD Wide | Image Gen 1792x1024 | $0.120/image |
| Whisper | Audio Transcription | $0.006/minute |
| GPT-4o | Text Generation | $0.005/1K tokens |
| TTS | Text-to-Speech | $0.015/1K chars |
| TTS HD | High Quality TTS | $0.030/1K chars |
| Sora | Video Generation | TBD (not public) |

### Google Models

| Model | Use Case | Cost per Unit |
|-------|----------|---------------|
| Gemini 1.5 Flash | Fast text tasks | $0.075/1M tokens |
| Gemini 1.5 Pro | Complex reasoning | $3.50/1M tokens |
| Gemini Vision | Image analysis | $0.075/1M tokens |
| Imagen 3 | Image Generation | TBD |

### Other Providers

| Provider | Model | Use Case | Notes |
|----------|-------|----------|-------|
| ElevenLabs | Voice AI | TTS & Cloning | Premium quality |
| Replicate | Various | Hosted models | Pay per second |
| Stability AI | SDXL | Image Gen | Self-hosted option |
| Suno | Music AI | Music Gen | API waitlist |

---

## Credit Pricing Strategy

### Current Pricing (1 credit ≈ $0.01)

```
Translation:  0.5 credits / 1000 words (min 1)
Summarize:    0.3 credits / 1000 words (min 1)
Transcribe:   1.0 credit  / minute audio (min 2)
```

### Proposed New Pricing

```
Image Gen Standard:  5 credits / image
Image Gen HD:        8 credits / image
Image Gen HD Wide:  10 credits / image
Video Gen 5s:       25 credits / video
Video Gen 10s:      40 credits / video
Video Gen 15s:      55 credits / video
Video Gen 20s:      70 credits / video
Code Assist:         1 credit  / request
TTS Standard:        2 credits / 1000 chars
TTS HD:              4 credits / 1000 chars
Grammar Check:       1 credit  / 1000 words
Paraphrase:          1 credit  / 500 words
```

---

## Technical Architecture

### File Structure for New Tools

```
src/app/[lng]/tools/
├── ai-image-generator/
│   ├── page.tsx
│   └── AIImageGeneratorClient.tsx
├── ai-video-generator/
│   ├── page.tsx
│   └── AIVideoGeneratorClient.tsx
├── ai-code-assistant/
│   ├── page.tsx
│   └── AICodeAssistantClient.tsx
└── ...

src/app/api/ai/
├── generate-image/route.ts
├── generate-video/route.ts
├── code-assist/route.ts
└── ...

src/lib/
├── ai-config.ts (update with new tools)
└── credits.ts (update pricing)
```

### Shared Components

```
src/components/
├── AICostPreview.tsx (existing - extend for new tools)
├── AIProgressIndicator.tsx (existing)
├── AIImagePreview.tsx (new - for image display)
├── AIVideoPlayer.tsx (new - for video playback)
└── AICodeEditor.tsx (new - for code input)
```

---

## Implementation Priority Queue

### Sprint 1 (Current)
1. [🚧] AI Image Generator (DALL-E 3)
2. [🚧] AI Video Generator (Sora - placeholder)
3. [ ] AI Grammar Checker

### Sprint 2
4. [ ] AI Paraphraser
5. [ ] AI Code Assistant
6. [ ] AI Email Writer

### Sprint 3
7. [ ] AI Voice Generator (TTS)
8. [ ] AI Caption Generator
9. [ ] AI Resume Builder

### Sprint 4
10. [ ] AI Image Upscaler
11. [ ] AI Logo Generator
12. [ ] AI SEO Optimizer

---

## Environment Variables Required

```env
# Current
GEMINI_API_KEY=xxx
OPENAI_API_KEY=xxx

# New (when implementing)
ELEVENLABS_API_KEY=xxx
REPLICATE_API_TOKEN=xxx
STABILITY_API_KEY=xxx
```

---

## Competitive Analysis

### Similar Platforms

| Platform | AI Tools | Pricing Model |
|----------|----------|---------------|
| Canva | 10+ AI tools | Freemium |
| Adobe Express | 8+ AI tools | Subscription |
| Kapwing | 5+ AI tools | Credits |
| Simplified | 20+ AI tools | Subscription |
| Copy.ai | Text AI only | Subscription |
| Jasper | Text AI only | Subscription |

### Our Differentiation
- **Privacy Focus**: Local tools where possible
- **Pay-per-use**: No subscriptions required
- **Transparent Pricing**: Credit costs shown upfront
- **Multi-language**: DE/EN support
- **Free Tier**: 10 credits on signup

---

## Ideas for Future Expansion

### AI Tool Ideas (Brainstorm)

1. **AI Meme Generator** - Create memes from text prompts
2. **AI Podcast Summarizer** - Summarize podcast episodes
3. **AI Meeting Notes** - Generate meeting summaries from recordings
4. **AI Product Description** - E-commerce product text
5. **AI Social Post Writer** - Platform-optimized posts
6. **AI Ad Copy Generator** - Marketing copy
7. **AI Story Generator** - Creative writing assistant
8. **AI Presentation Builder** - Slide deck generation
9. **AI Data Visualizer** - Charts from data descriptions
10. **AI Interview Prep** - Practice questions & feedback

### Integration Opportunities

- WordPress Plugin
- Shopify App
- Slack Bot
- Discord Bot
- Browser Extension
- Mobile App (React Native)

---

## Notes & Decisions Log

### 2026-01-22
- Created AI Tools Roadmap
- Prioritized Image & Video generation
- Sora API not yet public - will implement placeholder
- DALL-E 3 implementation started

### Future Decisions Needed
- [ ] Self-host image models vs API-only?
- [ ] Video storage strategy (temporary URLs vs CDN?)
- [ ] Batch processing for enterprise users?
- [ ] API access tier ($29/mo plan)?

---

*This document is maintained by the PureTools AI Development Team.*
*Review and update monthly or after major feature releases.*
