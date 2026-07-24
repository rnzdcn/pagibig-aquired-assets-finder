import { http } from '@/lib/http'

export async function getPropertyImages(ropaId: string, carousel = false): Promise<string[]> {
  try {
    return await http.post('images', { json: { ropaId, carousel } }).json<string[]>()
  } catch {
    return []
  }
}
