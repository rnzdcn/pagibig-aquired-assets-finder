import ky from 'ky'

export const http = ky.create({
  prefix: '/api',
  timeout: 20_000,
  retry: { limit: 1, methods: ['get'] },
})
