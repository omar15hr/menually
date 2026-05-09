import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={String(props.alt ?? '')} />
  },
}))
