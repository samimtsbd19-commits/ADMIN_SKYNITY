/**
 * MikroTik RouterOS REST API Client
 * Compatible with RouterOS v7.1+ REST API
 */

export interface RouterConfig {
  host: string
  port: number
  username: string
  password: string
  useHttps: boolean
}

export class MikroTikClient {
  private baseUrl: string
  private authHeader: string

  constructor(private config: RouterConfig) {
    const protocol = config.useHttps ? 'https' : 'http'
    this.baseUrl = `${protocol}://${config.host}:${config.port}/rest`
    this.authHeader = 'Basic ' + Buffer.from(`${config.username}:${config.password}`).toString('base64')
  }

  private async request<T>(method: string, path: string, body?: object): Promise<T> {
    const url = `${this.baseUrl}${path}`

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: this.authHeader,
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined,
      // Skip SSL verification for self-signed certs (development)
      // In production, use proper certificates
      ...(this.config.useHttps ? {} : {})
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`MikroTik API error ${res.status}: ${text}`)
    }

    // DELETE returns empty body
    if (res.status === 204 || res.headers.get('content-length') === '0') {
      return undefined as T
    }

    return res.json() as Promise<T>
  }

  get<T = any>(path: string): Promise<T> {
    return this.request<T>('GET', path)
  }

  post<T = any>(path: string, body: object): Promise<T> {
    return this.request<T>('PUT', path, body)
  }

  patch<T = any>(path: string, id: string, body: object): Promise<T> {
    return this.request<T>('PATCH', `${path}/${id}`, body)
  }

  remove(path: string, id: string): Promise<void> {
    return this.request<void>('DELETE', `${path}/${id}`)
  }

  /** Test connectivity — returns true if reachable */
  async ping(): Promise<{ ok: boolean; version?: string; error?: string }> {
    try {
      const res = await this.get<any[]>('/system/resource')
      const resource = Array.isArray(res) ? res[0] : res
      return { ok: true, version: resource?.['version'] }
    } catch (err: any) {
      return { ok: false, error: err.message }
    }
  }
}

/** Build a MikroTikClient from a HotspotRouter DB record */
export function clientFromRouter(router: {
  host: string
  port: number
  username: string
  password: string
  useHttps: boolean
}): MikroTikClient {
  return new MikroTikClient(router)
}
