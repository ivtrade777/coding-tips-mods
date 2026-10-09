import type { Register } from 'claude-code'

const QUIPS = [
  'Blaming the intern',
  'Googling the error',
  'Pretending to understand regex',
  'Turning it off and on again',
  'Reading the docs (finally)',
  'Asking the rubber duck',
]

let calls = 0

export const register: Register = on => {
  // Each time Claude uses a tool: count it and redraw
  on('tool.call', ($, e, next) => {
    calls += 1
    $.ui.invalidate('ui.render')
    return next(e)
  })

  // Each time the spinner is drawn: swap the word, add the count
  on('ui.render', { component: 'Spinner' }, ($, e, next) => {
    const word = QUIPS[calls % QUIPS.length]!
    return next({ ...e, props: { ...e.props, word, suffix: ` · tool calls: ${calls}…` } })
  })
}
