import type { EngineInterface, Register } from 'claude-code'

const EDIT_TOOLS = new Set(['Edit', 'Write', 'MultiEdit', 'NotebookEdit'])
const SKIP = new Set(['node_modules', '.git', 'dist', 'build', 'target', '.claude'])

let tools = 0
let changed = 0
const edited = new Set<string>()

function bar(percent: number) {
  const full = Math.round(percent / 10)
  return '▰'.repeat(full) + '▱'.repeat(10 - full)
}

function mood(percent: number) {
  if (percent < 50) return '😎'
  if (percent < 80) return '😅'
  return '🥵'
}

// Count the project's files changed since the session began, however Claude changed them
// (its Edit tool, a shell command, a script). Small walk, capped, skipping build folders.
async function countChanged($: EngineInterface) {
  const { startedAt } = await $.session.usage()
  let count = 0
  let seen = 0
  const walk = async (dir: string, depth: number) => {
    for (const entry of await $.fs.list(dir || undefined)) {
      if (++seen > 2000) return
      const path = dir ? `${dir}/${entry.name}` : entry.name
      if (entry.kind === 'dir' && depth < 6 && !SKIP.has(entry.name)) await walk(path, depth + 1)
      else if (entry.kind === 'file' && entry.mtimeMs >= startedAt) count += 1
    }
  }
  await walk('', 0)
  changed = count
}

export const register: Register = on => {
  // Count every tool call, and after it ran, recount the changed files
  on('tool.call', async ($, e, next) => {
    tools += 1
    if (EDIT_TOOLS.has(e.tool) && 'file_path' in e && typeof e.file_path === 'string') {
      edited.add(e.file_path)
    }
    $.ui.invalidate('ui.render')
    const ran = await next(e)
    await countChanged($).catch(() => {})
    $.ui.invalidate('ui.render')
    return ran
  }).catch(($, e, next) => next(e)) // if the HUD fails, the tool still runs

  // Draw the HUD in the band above the prompt
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey) return next(e)

    const { Box, Text } = $.ui.resolve(e)
    const usage = await $.session.usage()
    const minutes = Math.floor(((await $.clock.now()) - usage.startedAt) / 60000)
    const percent = Math.round(usage.context.percent ?? 0)
    const cost = usage.cost ? `$${usage.cost.usd.toFixed(2)}` : '-'
    const files = Math.max(changed, edited.size)

    return (
      <Box>
        <Text color="cyan" bold>HUD </Text>
        <Text>⏱ {minutes}m  🔧 {tools} tools  📝 {files} files  </Text>
        <Text color={percent < 80 ? 'cyan' : 'red'}>🧠 {bar(percent)} {percent}% </Text>
        <Text>{mood(percent)}  💸 {cost}</Text>
      </Box>
    )
  })
}
