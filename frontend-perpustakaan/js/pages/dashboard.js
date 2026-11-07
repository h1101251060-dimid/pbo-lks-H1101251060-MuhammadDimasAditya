import { bookApi, categoryApi } from '../api.js';
import { escapeHtml } from '../utils.js';

export async function renderDashboard(container) {
    const [books, categories] = await Promise.all([
        bookApi.list(),
        categoryApi.list(),
    ]);

    const latest = [...books].sort((a, b) => b.id - a.id).slice(0, 5);

    const items = latest.length
        ? latest
              .map(
                  (b) => `
            <li class="py-3 flex justify-between">
                <span>
                    <span class="font-medium">${escapeHtml(b.judul)}</span>
                    <span class="text-gray-500"> oleh ${escapeHtml(b.penulis)}</span>
                </span>
                <span class="text-gray-500">${escapeHtml(b.tahun)}</span>
            </li>`
              )
              .join('')
        : '<li class="py-3 text-gray-500">Belum ada buku.</li>';

    container.innerHTML = `
        <h2 class="text-2xl font-bold mb-4">Dashboard</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div class="bg-blue-500 text-white rounded-lg p-6 shadow">
                <p class="text-sm opacity-90">Total Buku</p>
                <p class="text-4xl font-bold">${books.length}</p>
            </div>
            <div class="bg-orange-500 text-white rounded-lg p-6 shadow">
                <p class="text-sm opacity-90">Kategori</p>
                <p class="text-4xl font-bold">${categories.length}</p>
            </div>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold mb-2">5 Buku Terbaru</h3>
            <ul class="divide-y">${items}</ul>
        </div>
    `;
}