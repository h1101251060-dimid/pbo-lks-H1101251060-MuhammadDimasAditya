import { bookApi } from '../api.js';
import { escapeHtml, showToast } from '../utils.js';

export async function renderBooks(container) {
    let books = [];

    async function load() {
        books = await bookApi.list();
        draw();
    }

    function draw() {
        const rows = books.length
            ? books
                  .map(
                      (b) => `
            <tr class="border-t">
                <td class="px-4 py-3">${escapeHtml(b.id)}</td>
                <td class="px-4 py-3">${escapeHtml(b.judul)}</td>
                <td class="px-4 py-3">${escapeHtml(b.penulis)}</td>
                <td class="px-4 py-3">${escapeHtml(b.tahun)}</td>
                <td class="px-4 py-3">${escapeHtml(b.stok)}</td>
                <td class="px-4 py-3 whitespace-nowrap">
                    <button data-edit="${escapeHtml(b.id)}" class="text-blue-600 hover:underline mr-3">Ubah</button>
                    <button data-delete="${escapeHtml(b.id)}" class="text-red-600 hover:underline">Hapus</button>
                </td>
            </tr>`
                  )
                  .join('')
            : '<tr><td colspan="6" class="px-4 py-6 text-center text-gray-500">Belum ada data buku.</td></tr>';

        container.innerHTML = `
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-2xl font-bold">Buku</h2>
                <button id="btn-add" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">+ Tambah Buku</button>
            </div>
            <div class="bg-white rounded-lg shadow overflow-x-auto">
                <table class="w-full text-left">
                    <thead class="bg-gray-50 text-gray-600">
                        <tr>
                            <th class="px-4 py-3">ID</th>
                            <th class="px-4 py-3">Judul</th>
                            <th class="px-4 py-3">Penulis</th>
                            <th class="px-4 py-3">Tahun</th>
                            <th class="px-4 py-3">Stok</th>
                            <th class="px-4 py-3">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;

        container.querySelector('#btn-add').addEventListener('click', () => openModal());

        container.querySelectorAll('[data-edit]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const book = books.find((b) => String(b.id) === btn.dataset.edit);
                if (book) openModal(book);
            });
        });

        container.querySelectorAll('[data-delete]').forEach((btn) => {
            btn.addEventListener('click', () => removeBook(btn.dataset.delete));
        });
    }

    function openModal(book = null) {
        const isEdit = book !== null;
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                <h2 class="text-xl font-bold mb-4">${isEdit ? 'Ubah Buku' : 'Tambah Buku'}</h2>
                <form class="space-y-3">
                    <div>
                        <label class="block text-sm text-gray-600 mb-1">Judul</label>
                        <input name="judul" type="text" value="${escapeHtml(book ? book.judul : '')}" class="w-full border rounded px-3 py-2">
                    </div>
                    <div>
                        <label class="block text-sm text-gray-600 mb-1">Penulis</label>
                        <input name="penulis" type="text" value="${escapeHtml(book ? book.penulis : '')}" class="w-full border rounded px-3 py-2">
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-sm text-gray-600 mb-1">Tahun</label>
                            <input name="tahun" type="number" value="${escapeHtml(book ? book.tahun : '')}" class="w-full border rounded px-3 py-2">
                        </div>
                        <div>
                            <label class="block text-sm text-gray-600 mb-1">Stok</label>
                            <input name="stok" type="number" value="${escapeHtml(book ? book.stok : 0)}" class="w-full border rounded px-3 py-2">
                        </div>
                    </div>
                    <div class="flex justify-end gap-2 pt-2">
                        <button type="button" data-cancel class="px-4 py-2 rounded border hover:bg-gray-50">Batal</button>
                        <button type="submit" class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Simpan</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(overlay);

        const form = overlay.querySelector('form');
        const close = () => overlay.remove();

        overlay.querySelector('[data-cancel]').addEventListener('click', close);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) close();
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                judul: form.judul.value.trim(),
                penulis: form.penulis.value.trim(),
                tahun: Number(form.tahun.value),
                stok: Number(form.stok.value),
            };

            try {
                const res = isEdit
                    ? await bookApi.update(book.id, data)
                    : await bookApi.create(data);
                showToast(res.message || 'Berhasil disimpan', 'success');
                close();
                await load();
            } catch (err) {
                showToast(err.message, 'error');
            }
        });
    }

    async function removeBook(id) {
        if (!confirm('Hapus buku dengan ID ' + id + '?')) return;
        try {
            const res = await bookApi.remove(id);
            showToast(res.message || 'Buku berhasil dihapus', 'success');
            await load();
        } catch (err) {
            showToast(err.message, 'error');
        }
    }

    await load();
}