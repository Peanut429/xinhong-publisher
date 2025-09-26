# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a Next.js 15 application called "xinhong-publisher" - an AI-powered content generation system for Xiaohongshu (Little Red Book) social media platform. The application generates articles, images, and selling points for automotive content using various LLM APIs and services.

## Common Development Commands

### Development
```bash
# Start development server with Turbopack
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint
```

### Testing & Validation
```bash
# Test the enhanced API endpoint
node test-enhanced-api.js

# Validate module structure
node validate-modules.js

# Test with custom parameters
ACCOUNT_ID=test-123 PHONE_NUMBER=13800138000 node test-enhanced-api.js
```

### Package Management
This project uses `pnpm` as the package manager. Always use `pnpm install` instead of npm or yarn.

## Architecture Overview

### Core Application Flow
1. **Data Import**: Excel files with Xiaohongshu note data are imported via `/import-data`
2. **Content Generation**: AI workflow generates articles, images, and selling points via `/api/write-note-enhanced`
3. **Manual Creation**: Users can manually generate content via `/generate-article` and `/write`

### Technology Stack
- **Framework**: Next.js 15 with App Router and Turbopack
- **Database**: PostgreSQL with Drizzle ORM
- **UI**: Tailwind CSS + Shadcn/ui components
- **AI/LLM**: Multiple providers (DeepSeek, Google Gemini, OpenAI) via Vercel AI SDK
- **Image Generation**: Volcano Engine (ByteDance) API
- **Web Search**: Bocha AI API integration
- **State Management**: TanStack React Query

### Database Architecture
- **Primary Database**: PostgreSQL via Drizzle ORM
- **Schema Location**: `db/schema/` with modular schema files
- **Main Tables**:
  - `xinhong_notes`: Stores imported social media notes
  - `volcano_tasks`: Tracks image generation tasks
- **Connection**: Connection pooling with SSL support and configurable parameters

### API Architecture
The application uses a modular API design:

- **Enhanced API**: `/api/write-note-enhanced` - Main AI workflow endpoint with fallback mechanisms
- **Generation APIs**: Various endpoints for article, image, and keyword generation
- **Import API**: `/api/import-data` - Handles Excel data import

### Service Layer
- **LLM Services** (`utils/llm.ts`): Manages multiple AI providers with failover
- **Image Generation** (`service/generate-image.ts`): Handles Volcano Engine image generation with polling
- **Web Search** (`service/web-search.ts`): Integrates Bocha AI search capabilities
- **Database Services**: Centralized database operations with retry mechanisms

### Key Directories
- `app/`: Next.js App Router pages and API routes
- `db/`: Database configuration, schema, and connection management
- `lib/`: Shared utilities and LLM configuration
- `service/`: External API integrations
- `prompts/`: AI prompt templates for content generation
- `utils/`: Utility functions for data processing and validation

## Environment Configuration

Required environment variables:
```bash
# Database
DATABASE_HOST=
DATABASE_PORT=5432
DATABASE_USER=
DATABASE_PASSWORD=
DATABASE_NAME=
DATABASE_SSL=false

# AI/LLM APIs
DEEPSEEK_API_KEY=
OPENAI_API_KEY=
BOCHA_API_KEY=
DASHSCOPE_API_KEY=

# External Services
# Volcano Engine authorization tokens are hardcoded in service files
```

## Development Notes

### Component System
- Uses Shadcn/ui component library with "new-york" style
- Custom component aliases configured in `components.json`
- Tailwind CSS with CSS variables for theming

### Database Operations
- All database operations use Drizzle ORM with prepared statements
- Connection pooling configured for production use
- Graceful connection handling with health checks

### AI Integration Patterns
- Multi-provider LLM setup with fallback mechanisms
- Structured prompt templates in `prompts/` directory
- JSON extraction utilities for parsing LLM responses
- MCP (Model Context Protocol) client integration for web search

### Data Processing
- Excel import functionality with comprehensive validation
- Batch processing for data transformation
- Error handling and detailed validation reporting

### Image Generation Workflow
1. Submit generation task to Volcano Engine
2. Poll task status until completion
3. Store results in volcano_tasks table
4. Return generated image URLs

### Content Generation Workflow
1. Extract search keywords from existing content
2. Perform web search for relevant information
3. Generate article content using LLM
4. Generate selling points and promotional content
5. Create accompanying images
6. Return complete content package

## Testing Strategy

The application includes custom testing scripts:
- `test-enhanced-api.js`: Tests the main AI workflow API
- `validate-modules.js`: Validates modular API structure
- Manual testing through UI components for each feature

## Performance Considerations

- Database connection pooling (max 20 connections)
- LLM request retries with exponential backoff
- Image generation polling with 2-second intervals
- Turbopack for faster development builds
- Next.js production optimizations enabled