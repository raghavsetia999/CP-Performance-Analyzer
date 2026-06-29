import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { app } from '../../src/app.js'

describe('health API', () => {
  it('returns service health without requiring MongoDB', async () => {
    const response = await request(app).get('/api/health')

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({
      success: true,
      data: { status: 'ok', service: 'cp-performance-analyzer-api' },
    })
  })

  it('returns a stable not-found error envelope', async () => {
    const response = await request(app).get('/api/does-not-exist')

    expect(response.status).toBe(404)
    expect(response.body.error.code).toBe('ROUTE_NOT_FOUND')
  })

  it('rejects invalid registration input before database access', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: 'R',
      email: 'not-an-email',
      password: 'short',
    })

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
  })
})
