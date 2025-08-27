# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev     # Start development server
npm run build   # Build for production
npm run start   # Start production server
npm run lint    # Run ESLint
```

## Project Architecture

This is a **Horizon AI Template** - a ChatGPT AI admin template built with Next.js 15, React 19, and Chakra UI. It provides a conversational AI interface similar to ChatGPT.

### Key Architecture Components

**Framework Stack:**
- Next.js 15 with App Router (`app/` directory structure)
- React 19 (RC version)
- TypeScript 4.9.5
- Chakra UI for component library and theming

**API Integration:**
- OpenAI API integration via streaming (`src/utils/chatStream.ts`)
- Edge runtime API routes (`app/api/chatAPI/route.ts`)
- Supports GPT-4o and GPT-3.5-turbo models

**Layout System:**
- Sidebar-based navigation (`src/components/sidebar/`)
- Admin layout with navbar and footer
- Route-based navigation system (`src/routes.tsx`)
- Responsive design with mobile support

**State Management:**
- React Context for sidebar state (`src/contexts/SidebarContext.ts`)
- localStorage for API key persistence
- Component-level state for chat functionality

**Chat Implementation:**
- Streaming responses using Server-Sent Events
- Real-time message display with markdown support
- Model switching (GPT-4o/GPT-3.5) in UI
- Custom message box components (`src/components/MessageBox.tsx`)

### Directory Structure

- `app/` - Next.js App Router pages and API routes
- `src/components/` - Reusable UI components organized by type
- `src/theme/` - Chakra UI theme configuration and customizations
- `src/types/` - TypeScript type definitions
- `src/utils/` - Utility functions including OpenAI streaming

### Important Technical Details

**Path Aliases:** Uses `@/*` pointing to `src/*` (configured in `tsconfig.json`)

**API Key Management:** 
- Stored in localStorage with 'sk-' prefix validation
- Fallback to `NEXT_PUBLIC_OPENAI_API_KEY` environment variable
- Required for OpenAI API calls

**Styling:** 
- Chakra UI with custom theme extensions
- Additional CSS files in `src/styles/`
- Responsive design patterns throughout

**Navigation:**
- Route definitions in `src/routes.tsx` with icon mappings
- Many routes marked as `disabled: true` (placeholder/premium features)
- Active route detection utilities in `src/utils/navigation.tsx`

This template is designed as a foundation for building AI-powered chat applications with a professional admin interface.

## Important Rules for Claude

**Git Operations:**
- NEVER commit, push, or perform ANY git operations unless explicitly requested by the User
- Wait for explicit permission before using git commands
- This includes: git add, git commit, git push, git pull, git merge, etc.

**File Creation:**
- NEVER create files unless absolutely necessary
- ALWAYS prefer editing existing files
- NEVER proactively create documentation files (*.md) or README files unless explicitly requested