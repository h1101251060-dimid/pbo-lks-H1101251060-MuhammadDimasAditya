import { categoryApi } from '../api.js';
import { escapeHtml, showToast } from '../utils.js';

export async function renderCategories(container) {
    let categories = [];

    async function load() {
        categories = await categoryApi.list();
        draw();
    }

    function draw() {
        const rows = categories.length
            ? categories
                  .map(
                      (c) => `
            <tr class="border-t">
                <td class="px-4 py-3">${escapeHtml(c.id)}</td>
                <td class="px-4 py-3">${escapeHtml(c.nama)}</td>
                <td class="px-4 py-3">${escapeHtml(c.deskripsi)}</td>
                <td class="px-4 py-3 whitespace-nowrap">
                    <button data-edit="${escapeHtml(c.id)}" class="text-blue-600 hover:underline mr-3">Ubah</button>
                    <button data-delete="${escapeHtml(c.id)}" class="text-red-600 hover:underline">Hapus</button>
                </td>
            </tr>`
                  )
                  .join('')
            : '<tr><td colspan="4" class="px-4 py-6 text-center text-gray-500">Belum ada data kategori.</td></tr>';

        container.innerHTML = `
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-2xl font-bold">Kategori</h2>
                <button id="btn-add" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">+ Tambah Kategori</button>
            </div>
            <div class="bg-white rounded-lg shadow overflow-x-auto">
                <table class="w-full text-left">
                    <thead class="bg-gray-50 text-gray-600">
                        <tr>
                            <th class="px-4 py-3">ID</th>
                            <th class="px-4 py-3">Nama</th>
                            <th class="px-4 py-3">Deskripsi</th>
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
                const cat = categories.find((c) => String(c.id) === btn.dataset.edit);
                if (cat) openModal(cat);
            });
        });

        container.querySelectorAll('[data-delete]').forEach((btn) => {
            btn.addEventListener('click', () => removeCategory(btn.dataset.delete));
        });
    }

    function openModal(cat = null) {
        const isEdit = cat !== null;
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                <h2 class="text-xl font-bold mb-4">${isEdit ? 'Ubah Kategori' : 'Tambah Kategori'}</h2>
                <form class="space-y-3">
                    <div>
                        <label class="block text-sm text-gray-600 mb-1">Nama</label>
                        <input name="nama" type="text" value="${escapeHtml(cat ? cat.nama : '')}" class="w-full border rounded px-3 py-2">
                    </div>
                    <div>
                        <label class="block text-sm text-gray-600 mb-1">Deskripsi</label>
                        <textarea name="deskripsi" rows="3" class="w-full border rounded px-3 py-2">${escapeHtml(cat ? cat.deskripsi : '')}</textarea>
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
                nama: form.nama.value.trim(),
                deskripsi: form.deskripsi.value.trim(),
            };

            try {
                const res = isEdit
                    ? await categoryApi.update(cat.id, data)
                    : await categoryApi.create(data);
                showToast(res.message || 'Berhasil disimpan', 'success');
                close();
                await load();
            } catch (err) {
                showToast(err.message, 'error');
            }
        });
    }

    async function removeCategory(id) {
        if (!confirm('Hapus kategori dengan ID ' + id + '?')) return;
        try {
            const res = await categoryApi.remove(id);
            showToast(res.message || 'Kategori berhasil dihapus', 'success');
            await load();
        } catch (err) {
            showToast(err.message, 'error');
        }
    }

    await load();
}