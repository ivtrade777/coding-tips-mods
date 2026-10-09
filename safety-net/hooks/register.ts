import type { Register } from 'claude-code'

const DANGEROUS: [RegExp, string][] = [
  [/\brm\s+-[a-z]*r[a-z]*f|\brm\s+-[a-z]*f[a-z]*r/i, 'rm -rf'],
  [/\bgit\s+push\b.*(--force\b|\s-f\b)/i, 'git push --force'],
  [/\bgit\s+reset\s+--hard\b/i, 'git reset --hard'],
  [/\bdrop\s+(table|database)\b/i, 'DROP TABLE'],
]

export const register: Register = on => {
  on('tool.call', { tool: 'Bash' }, ($, e, next) => {
    const hit = DANGEROUS.find(([pattern]) => pattern.test(e.command))
    if (!hit) return next(e)

    $.ui.toast(`🛑 safety-net blocked: ${hit[1]}`)
    return { deny: `safety-net: "${hit[1]}" is blocked. Ask the user to run it themselves if they really mean it.` }
  }).catch(($, e, next) =>
    // If the guard itself fails, block instead of letting the command through
    next.called ? next(e) : { deny: 'safety-net: the guard failed, so the command was blocked.' },
  )
}
