import type { Register } from 'claude-code'

const EDIT_TOOLS = new Set(['Edit', 'Write', 'MultiEdit', 'NotebookEdit'])

let tools = 0
const files = new Set<string>()

function bar(percent: number) {
  const full = Math.round(percent / 10)
  return '▰'.repeat(full) + '▱'.repeat(10 - full)
}

function mood(percent: number) {
  if (percent < 50) return '😎'
  if (percent < 80) return '😅'
  return '🥵'
}

export const register: Register = on => {
  // Count every tool call, and remember which files Claude edits
  on('tool.call', ($, e, next) => {
    tools += 1
    if (EDIT_TOOLS.has(e.tool) && 'file_path' in e && typeof e.file_path === 'string') {
      files.add(e.file_path)
    }
    $.ui.invalidate('ui.render')
    return next(e)
  })

  // Draw the HUD in the band above the prompt
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey) return next(e)

    const { Box, Text } = $.ui.resolve(e)
    const usage = await $.session.usage()
    const minutes = Math.floor(((await $.clock.now()) - usage.startedAt) / 60000)
    const percent = Math.round(usage.context.percent ?? 0)
    const cost = usage.cost ? `$${usage.cost.usd.toFixed(2)}` : '-'

    return (
      <Box>
        <Text color="cyan" bold>HUD </Text>
        <Text>⏱ {minutes}m  🔧 {tools} tools  📝 {files.size} files  </Text>
        <Text color={percent < 80 ? 'cyan' : 'red'}>🧠 {bar(percent)} {percent}% </Text>
        <Text>{mood(percent)}  💸 {cost}</Text>
      </Box>
    )
  })
}
