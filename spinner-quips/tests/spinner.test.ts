import { test, expect } from 'claude-code/testing'

test('spinner shows a quip and the tool-call count', async ($, on) => {
  let seen: { word?: string; suffix?: string } = {}
  on('tool.call', () => ({ result: { stdout: '', stderr: '', interrupted: false } }) as never)
  on('ui.render', { component: 'Spinner' }, ($, e) => { seen = e.props; const { Text } = $.ui.resolve(e); return h(Text, {}, e.props.word) })
  await $.tool.call({ tool: 'Bash', command: 'ls' })
  await $.tool.call({ tool: 'Bash', command: 'ls' })
  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ plugin: 'spinner-quips', surface, component: 'Spinner', props: { word: 'Sauteing', message: null, suffix: '…', mode: 'thinking' } })
    expect(seen.suffix).toBe(' · tool calls: 2…')
    expect(seen.word).toBe('Pretending to understand regex')
    await ui.unmount()
  }
})
