import { test, expect } from 'claude-code/testing'

const DANGEROUS = ['rm -rf build', 'rm -fr /tmp/x', 'git push --force origin main', 'git push -f', 'git reset --hard HEAD~3', 'psql -c "DROP TABLE users"']
const SAFE = ['ls -la', 'git push origin main', 'rm notes.txt', 'npm test']

test('blocks dangerous commands', async ($, on) => {
  let ran = 0
  on('tool.call', { tool: 'Bash' }, () => { ran += 1; return { result: { stdout: 'ok', stderr: '', interrupted: false } } as never })
  for (const command of DANGEROUS) {
    const r = await $.tool.call({ tool: 'Bash', command })
    expect(r.deny).toContain('safety-net')
  }
  expect(ran).toBe(0)
})

test('lets safe commands through', async ($, on) => {
  let ran = 0
  on('tool.call', { tool: 'Bash' }, () => { ran += 1; return { result: { stdout: 'ok', stderr: '', interrupted: false } } as never })
  for (const command of SAFE) await $.tool.call({ tool: 'Bash', command })
  expect(ran).toBe(SAFE.length)
})
