import { beforeAll, afterAll, afterEach, vi } from 'vitest'

// Mock Next.js server components
vi.mock('next/server', () => ({
    NextRequest: class {
        url: string
        constructor(url: string) {
            this.url = url
        }
        json() {
            return Promise.resolve({})
        }
        formData() {
            return Promise.resolve(new FormData())
        }
    },
    NextResponse: {
        json: (data: unknown, init?: ResponseInit) => {
            const status = init?.status || 200;
            return {
                ...new Response(JSON.stringify(data), init),
                status,
                json: () => Promise.resolve(data),
            }
        },
    },
}))

// Mock environment
beforeAll(() => {
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
    process.env.NEXTAUTH_SECRET = 'test-secret'
})

afterAll(() => {
    vi.restoreAllMocks()
})

afterEach(() => {
    vi.clearAllMocks()
})
