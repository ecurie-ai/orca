import type { TuiAgent } from './tui-agent'
import { isTuiAgent } from './tui-agent-config'

// Must equal the desktop agent catalog's id order exactly; quick-workspace-agent-selection
// asserts it. Despite the name it does more than automatic fallback: it also drives the
// dashboard launch options and the agent picker, so membership means "reachable" and
// position means both "shown here" and "preferred". Reordering one list means reordering both.
export const TUI_AGENT_AUTO_PICK_ORDER = [
  'claude',
  // Why second: `ocx claude` execs the same Claude Code binary through the proxy, so it
  // beats every non-Claude agent as a fallback. Behind bare `claude` so the head of this
  // list — also the agent shown before detection resolves — stays Claude on hosts without ocx.
  'ocx-claude',
  'claude-agent-teams',
  'openclaude',
  'codex',
  'grok',
  'copilot',
  'opencode',
  'mimo-code',
  'ante',
  'trae',
  'pi',
  'omp',
  'prime-agent',
  'gemini',
  'antigravity',
  'aider',
  'goose',
  'amp',
  'kilo',
  'kiro',
  'crush',
  'aug',
  'autohand',
  'cline',
  'codebuff',
  'command-code',
  'continue',
  'cursor',
  'droid',
  'kimi',
  'mistral-vibe',
  'qwen-code',
  'rovo',
  'hermes',
  'devin',
  'openclaw',
  // Why last, not omitted: this list also feeds the dashboard launch options and
  // quick workspace selection, so omitting an agent hides it instead of merely
  // deprioritising it. Last position keeps Cavalier reachable everywhere while
  // `pickTuiAgent` (first detected wins) never selects it over another install.
  'cavalier'
] as const satisfies readonly TuiAgent[]

// Why: fresh installs should expose Claude Agent Teams in agent pickers; the
// persistence migration separately preserves the old hidden default for legacy profiles.
export const DEFAULT_DISABLED_TUI_AGENTS = [] as const satisfies readonly TuiAgent[]

export function pickTuiAgent(
  preferred: TuiAgent | 'blank' | null | undefined,
  detected: Iterable<TuiAgent>,
  disabled?: Iterable<unknown> | null
): TuiAgent | null {
  if (preferred === 'blank') {
    return null
  }
  const disabledSet = new Set(normalizeDisabledTuiAgents(disabled))
  const detectedSet = detected instanceof Set ? detected : new Set(detected)
  if (preferred && detectedSet.has(preferred) && !disabledSet.has(preferred)) {
    return preferred
  }
  for (const agent of TUI_AGENT_AUTO_PICK_ORDER) {
    if (detectedSet.has(agent) && !disabledSet.has(agent)) {
      return agent
    }
  }
  return null
}

export function normalizeDisabledTuiAgents(value: unknown): TuiAgent[] {
  if (!Array.isArray(value)) {
    return []
  }
  const seen = new Set<TuiAgent>()
  for (const item of value) {
    if (isTuiAgent(item)) {
      seen.add(item)
    }
  }
  return [...seen]
}

export function haveSameDisabledTuiAgents(left: unknown, right: unknown): boolean {
  const leftSet = new Set(normalizeDisabledTuiAgents(left))
  const rightSet = new Set(normalizeDisabledTuiAgents(right))
  return leftSet.size === rightSet.size && [...leftSet].every((agent) => rightSet.has(agent))
}

export function isTuiAgentEnabled(agent: TuiAgent, disabled?: Iterable<unknown> | null): boolean {
  return !normalizeDisabledTuiAgents(disabled).includes(agent)
}

export function filterEnabledTuiAgents<T extends TuiAgent>(
  agents: Iterable<T>,
  disabled?: Iterable<unknown> | null
): T[] {
  const disabledSet = new Set(normalizeDisabledTuiAgents(disabled))
  return [...agents].filter((agent) => !disabledSet.has(agent))
}
