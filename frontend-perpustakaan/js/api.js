import { BASE_URL } from './config.js';

class ApiClient {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    async request(path, options = {}) {
        const headers = { Accept: 'application/json' };
        if (options.body) {
            headers['Content-Type'] = 'application/json';
        }

        let response;
        try {
            response = await fetch(this.baseUrl + path, { ...options, headers });
        } catch (e) {
            throw new Error('Tidak dapat terhubung ke server API');
        }

        let json = null;
        try {
            json = await response.json();
        } catch (e) {
            json = null;
        }

        if (!response.ok || (json && json.success === false)) {
            throw new Error((json && json.message) || 'Terjadi kesalahan (' + response.status + ')');
        }
        return json;
    }

    get(path) {
        return this.request(path);
    }

    post(path, data) {
        return this.request(path, { method: 'POST', body: JSON.stringify(data) });
    }

    put(path, data) {
        return this.request(path, { method: 'PUT', body: JSON.stringify(data) });
    }

    delete(path) {
        return this.request(path, { method: 'DELETE' });
    }
}

const client = new ApiClient(BASE_URL);

export const bookApi = {
    list: () => client.get('/books').then((r) => r.data),
    create: (data) => client.post('/books', data),
    update: (id, data) => client.put('/books/' + id, data),
    remove: (id) => client.delete('/books/' + id),
};

export const categoryApi = {
    list: () => client.get('/categories').then((r) => r.data),
    create: (data) => client.post('/categories', data),
    update: (id, data) => client.put('/categories/' + id, data),
    remove: (id) => client.delete('/categories/' + id),
};