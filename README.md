# v0-skills

> EXPERIMENTAL STAGE, use at your own risk.

Your coding agent already understands your codebase — the framework, component patterns, styling conventions, and project structure. This skill lets the agent use that knowledge to craft precise prompts for [v0](https://v0.dev), generate production-ready UI components, and pull the code directly into your project. No copy-pasting, no manual prompt engineering.

## Why agent-driven v0?

When you use v0 manually, you write prompts yourself. You have to describe your tech stack, conventions, and requirements from memory. The results need manual adaptation to fit your project.

With this skill, the agent does it all:

```
You: "Add a settings page"
  → Agent reads your codebase (Next.js 14, Tailwind, shadcn/ui, App Router...)
    → Agent crafts a detailed v0 prompt with your exact stack and conventions
      → Agent calls v0 API → receives generated components
        → Agent adapts imports, naming, routing to match your project
          → Code lands in your project, ready to use
```

**The agent is the best prompt engineer for your project** — it has read every file, knows every pattern, and translates your one-line request into a detailed v0 prompt that produces components matching your codebase from the start.

## What is this?

[v0](https://v0.dev) is Vercel's AI-powered UI generator that creates production-ready React components from text prompts. This project is a **skill** — an instruction file (`SKILL.md`) paired with a CLI tool (`v0.js`) that teaches a coding agent how to interact with the v0 API.

A skill extends what the agent can do. Once installed, the agent reads `SKILL.md` for instructions, runs CLI commands against the v0 API, and handles the full workflow autonomously.

### What the agent can do

| Capability | Description |
|------------|-------------|
| **Analyze** your codebase | Reads your project to understand stack, patterns, conventions |
| **Craft** optimized prompts | Composes detailed v0 prompts based on your actual code |
| **Generate** components | Calls v0 API to create UI from the crafted prompt |
| **Iterate** on designs | Sends follow-up messages to refine generated output |
| **Integrate** into your project | Adapts imports, naming, routing, and installs dependencies |
| **Browse** existing v0 work | Lists and searches your v0 chats, fetches code from any version |

### Agent compatibility

Built for [Claude Code](https://docs.anthropic.com/en/docs/claude-code) using the `npx skills` system. Other coding agents (Cursor, Windsurf, Cline, etc.) can also use it if they support reading instruction files — point them to `skills/v0/SKILL.md` and ensure `node scripts/v0.js` is accessible.

## Setup

### 1. Get your API key

Go to https://v0.dev/chat/settings/keys and create a key.

### 2. Configure the key

**Option A: Profile (recommended — supports multiple accounts)**

```bash
# Store key directly
node skills/v0/scripts/v0.js config profile set personal --key v0_key_abc123

# Or reference an environment variable (key stays in your shell, not in config file)
node skills/v0/scripts/v0.js config profile set team --key 'env://V0_TEAM_API_KEY'
```

**Option B: Environment variable (single account)**

```bash
export V0_API_KEY=your-api-key
```

Add to your shell profile (`~/.zshrc`, `~/.bashrc`) for persistence.

**Key resolution priority:** `--api-key` flag > `--profile` flag > `V0_API_KEY` env var > active profile in config

### 3. Install the skill

```bash
npx skills add ragingwind/v0-skills -g
```

For local development (from the repo root):

```bash
npx skills add . -g
```

## Usage

In Claude Code, type:

```
/v0
```

Then describe what you want in plain language. The agent reads SKILL.md and handles the rest.

### Example conversations

**Generate from your codebase context (the key workflow):**
> "Add a settings page with profile editing and notification preferences"
> "Create a data table component that matches our existing dashboard style"
> "Build a modal for image uploads — follow the same patterns as our other modals"

The agent reads your project, sees your tech stack and conventions, crafts a precise v0 prompt, generates the component, and integrates it — all from one sentence.

**Fetch and integrate existing v0 work:**
> "Grab the dashboard component from v0 and add it to my local project"
> "Search my v0 chats for anything related to modals"

**Iterate on generated components:**
> "Take the dashboard I made in v0, add dark mode, then extract it to my local project"
> "Refine the last v0 component — make it responsive and add loading states"

### End-to-end example

You say: *"Add a pricing page with three tiers"*

Here's what the agent does:

1. **Reads your codebase** — discovers Next.js 14 App Router, Tailwind CSS, shadcn/ui, existing page layout with sidebar navigation
2. **Crafts a v0 prompt** — *"Pricing page with three tiers (Free, Pro, Enterprise). Next.js 14 App Router, TypeScript, Tailwind CSS, shadcn/ui (Card, Button, Badge). Responsive: stack cards on mobile. Include monthly/annual toggle, feature comparison, and highlighted recommended tier."*
3. **Calls v0 API** — `create_chat "<crafted prompt>"` → receives generated source code as JSON
4. **Integrates the code** — writes files into your project, adapts `@/components/ui` imports, applies your naming conventions, adds the route
5. **Iterates if needed** — `send_message <chatId> "Add annual/monthly toggle with 20% discount badge"` → pulls updated code

You wrote one sentence. The agent wrote the prompt that would have taken you minutes to compose, because it already knows your codebase.

## How it works (for contributors)

The skill has two parts:

| File | Audience | Purpose |
|------|----------|---------|
| `skills/v0/SKILL.md` | The coding agent | Instructions, command reference, prompt patterns, workflow guides |
| `skills/v0/scripts/v0.js` | The coding agent (via CLI) | Node.js wrapper around the v0 Platform API, outputs JSON |

The agent reads SKILL.md to understand what commands are available and how to use them effectively. It then executes `v0.js` commands, parses the JSON output, and takes action based on the results.

### Development

1. Edit `SKILL.md` for skill instructions (what the agent reads)
2. Update `scripts/v0.js` for API functions and CLI commands
3. Run tests: `node skills/v0/scripts/v0.test.js`

> For detailed command documentation, see [SKILL.md](./skills/v0/SKILL.md)

## License

MIT
