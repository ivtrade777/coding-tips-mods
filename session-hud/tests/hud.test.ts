import { test, expect } from 'claude-code/testing'

test('HUD counts tools and edited files', async ($, on) => {
  on('tool.call', () => ({ result: {} }) as never)
  on('session.usage' as never, (() => ({ value: { startedAt: 0, context: { window: 200000, percent: 42 }, rateLimits: [], cost: { usd: 0.37 } } })) as never)
  on('clock.now' as never, (() => ({ value: 12 * 60000 })) as never)
  await $.tool.call({ tool: 'Bash', command: 'ls' })
  await $.tool.call({ tool: 'Edit', file_path: '/demo/a.ts', old_string: 'a', new_string: 'b' } as never)
  await $.tool.call({ tool: 'Write', file_path: '/demo/b.ts', content: 'x' } as never)
  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ plugin: 'session-hud', surface, component: 'AbovePrompt', props: { hasSurvey: false, isWorking: false } as never })
    expect(await ui.find({ type: 'Text', text: /3 tools/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /2 files/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /42%/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /12m/ })).toBeDefined()
    await ui.unmount()
  }
})
