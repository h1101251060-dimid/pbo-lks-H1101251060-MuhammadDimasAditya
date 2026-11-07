import { renderDashboard } from './pages/dashboard.js';
import { renderBooks } from './pages/books.js';
import { renderCategories } from './pages/categories.js';
import { escapeHtml } from './utils.js';

const routes = {
    dashboard: renderDashboard,
    books: renderBooks,
    categories: renderCategories,
};

function setActiveNav(name) {
    document.querySelectorAll('[data-nav]').forEach((link) => {
        link.classList.toggle('active', link.dataset.nav === name);
    });
}

async function router() {
    const requested = location.hash.replace('#/', '');
    const name = routes[requested] ? requested : 'dashboard';
    const app = document.getElementById('app');

    setActiveNav(name);
    app.innerHTML = '<p class="text-gray-500">Memuat...</p>';

    try {
        await routes[name](app);
    } catch (e) {
        app.innerHTML =
            '<div class="bg-red-100 text-red-700 p-4 rounded">' +
            escapeHtml(e.message) +
            '</div>';
    }
}

window.addEventListener('hashchange', router);
router();