export class E2ETestClient {
  private token: string | null = null;
  private expressUrl = 'http://127.0.0.1:5000/api/v1';
  private honoUrl = 'http://127.0.0.1:3001/api/trpc';

  setToken(token: string | null) {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
      headers['Cookie'] = `external_jwt=${this.token}`;
    }
    return headers;
  }

  // --- TRPC Proxy API Calls ---

  async trpcQuery(path: string, input: any = {}) {
    const url = `${this.honoUrl}/${path}?input=${encodeURIComponent(JSON.stringify({ json: input }))}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`tRPC Query HTTP error: ${response.status}`);
    }

    const data = await response.json() as any;
    if (data.error) {
      throw new Error(data.error.json?.message || data.error.message || 'tRPC Query Error');
    }
    return data.result.data.json;
  }

  async trpcMutation(path: string, input: any = {}) {
    const url = `${this.honoUrl}/${path}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...this.getHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ json: input })
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`tRPC Mutation HTTP error: ${response.status} - ${text}`);
    }

    const data = await response.json() as any;
    if (data.error) {
      throw new Error(data.error.json?.message || data.error.message || 'tRPC Mutation Error');
    }
    return data.result.data.json;
  }

  // --- Direct Express API Calls ---

  async expressGet(path: string) {
    const response = await fetch(`${this.expressUrl}${path}`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    return response;
  }

  async expressPost(path: string, body: any) {
    const response = await fetch(`${this.expressUrl}${path}`, {
      method: 'POST',
      headers: {
        ...this.getHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    return response;
  }

  async expressPut(path: string, body: any) {
    const response = await fetch(`${this.expressUrl}${path}`, {
      method: 'PUT',
      headers: {
        ...this.getHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    return response;
  }

  async expressPatch(path: string, body: any) {
    const response = await fetch(`${this.expressUrl}${path}`, {
      method: 'PATCH',
      headers: {
        ...this.getHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    return response;
  }

  async expressDelete(path: string) {
    const response = await fetch(`${this.expressUrl}${path}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    return response;
  }

  // --- Database State / Backdoor Control Calls ---

  async clearDatabase() {
    const response = await fetch('http://127.0.0.1:5001/test-db/clear', { method: 'POST' });
    if (!response.ok) throw new Error('Failed to clear mock database');
  }

  async insertData(table: string, data: any) {
    const response = await fetch('http://127.0.0.1:5001/test-db/insert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table, data })
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(`Failed to insert data: ${JSON.stringify(err)}`);
    }
  }

  async getTableData(table: string) {
    const response = await fetch(`http://127.0.0.1:5001/test-db/get?table=${table}`);
    if (!response.ok) throw new Error(`Failed to get table data for ${table}`);
    const data = await response.json() as any;
    return data.data;
  }

  async updateData(table: string, id: string, data: any) {
    const response = await fetch('http://127.0.0.1:5001/test-db/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table, id, data })
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Unknown update error' }));
      throw new Error(`Failed to update data: ${JSON.stringify(err)}`);
    }
  }
}
