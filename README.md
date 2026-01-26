# v0-skills

A Claude Code skill for [v0](https://v0.dev) development with React, TypeScript, and modern web best practices.

## What Does the LLM Do?

This skill gives Claude read-only access to your v0 projects, bridging the gap between v0's AI-generated components and Claude's code analysis capabilities.

### Available Commands

When you invoke `/v0`, Claude can:

- **List your v0 chats** - See all your v0 conversations and projects
- **Browse project structure** - Explore the file tree of any v0 project
- **Extract component code** - Retrieve source code from v0-generated components
- **Get files by path** - Access specific files or directories

### Example Workflows

Ask Claude things like:

- "List my recent v0 projects"
- "Show the file structure of my dashboard project"
- "Extract the authentication components from my v0 chat"
- "Help me understand how this v0 component handles state"
- "Compare the patterns used across my v0 projects"

### How It Works

1. You invoke the skill with `/v0`
2. Claude uses the v0 API to access your projects (read-only)
3. Claude analyzes, explains, or helps you refactor the code

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

Local development:
```bash
npx skills link
```

Learn more at [skills.sh](https://skills.sh/)

## Usage

```
/v0
```

## Development

1. Edit `skill.md` for skill instructions
2. Update `package.json` for metadata
3. Test locally with `npx skills link`

## License

MIT
