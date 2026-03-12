# v0-skills

> EXPERIMENTAL STAGE, use at your own risk.

A Claude Code skill for [v0](https://v0.dev) development with React, TypeScript, and modern web best practices.

## What Does the LLM Do?

This skill gives Claude read and write access to your v0 projects — fetching existing code and generating new components. It bridges v0's AI-generated components with Claude's code analysis and local project integration.

### Read — Fetch code from v0

- **List and search chats** — Browse your v0 conversations, search by name or file
- **Extract component code** — Retrieve source code from any chat

### Write — Generate new UI

- **Generate from prompt** — Create new v0 components with natural language
- **Iterate and refine** — Send follow-up messages to improve generated code

### Example Workflows

Ask Claude things like:

- "List my recent v0 projects"
- "Search my v0 chats for anything related to modals"
- "Grab the dashboard component from v0 and add it to my local project"
- "Create a data table with sorting, filtering, and pagination using shadcn/ui"
- "Take the dashboard I made in v0, add dark mode, then extract it to my local project"

### How It Works

1. You invoke the skill with `/v0`
2. Claude uses the v0 API to access your projects (read and write)
3. Claude analyzes, generates, iterates, or helps you integrate the code locally

> For detailed command documentation, see [SKILL.md](./skills/v0/SKILL.md)

## API Key Setup

Set your v0 API key as an environment variable:

```bash
export V0_API_KEY=your_api_key_here
```

Or add it to your shell profile for persistence.

## Installation

```bash
npx skills install ragingwind/v0-skills
```

Learn more at [skills.sh](https://skills.sh/)

## Usage

```
/v0
```

## Development

1. Edit `SKILL.md` for skill instructions
2. Update `scripts/v0.js` for API functions and CLI commands
3. Run tests: `node skills/v0/scripts/v0.test.js`

## License

MIT
