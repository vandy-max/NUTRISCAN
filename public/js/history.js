document.addEventListener('DOMContentLoaded', function() {
    loadHistory();

    document.getElementById('logoutButton').addEventListener('click', logout);
});

let currentPage = 1;
const limit = 10;

async function loadHistory(page = 1) {
    currentPage = page;
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = `
        <div class="text-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p class="mt-2 text-gray-400">Loading history...</p>
        </div>
    `;

    // Get filter values
    const method = document.getElementById('filterMethod').value;
    const match = document.getElementById('filterMatch').value;
    const date = document.getElementById('filterDate').value;
    const search = document.getElementById('filterSearch').value;

    let query = `?page=${page}&limit=${limit}`;
    if (method) query += `&method=${method}`;
    if (match) query += `&match=${match}`;
    if (date) query += `&date=${date}`;
    if (search) query += `&search=${encodeURIComponent(search)}`;

    try {
        const response = await fetch(`/api/history${query}`);
        const result = await response.json();

        if (result.success) {
            renderHistoryList(result.history);
            renderPagination(result.pagination);
        } else {
            historyList.innerHTML = `<div class="text-center text-danger py-4">${result.message || 'Failed to load history.'}</div>`;
        }
    } catch (error) {
        console.error('Error loading history:', error);
        historyList.innerHTML = `<div class="text-center text-danger py-4">An error occurred while loading history.</div>`;
    }
}

function renderHistoryList(history) {
    const historyList = document.getElementById('historyList');
    if (history.length === 0) {
        historyList.innerHTML = '<div class="text-center text-gray-400 py-8">No history found for the selected filters.</div>';
        return;
    }

    historyList.innerHTML = history.map(entry => {
        const analysis = entry.analysis_result || {};
        const match = entry.match_percentage || 0;
        const date = new Date(entry.created_at).toLocaleString();

        return `
            <div class="flash-card flex flex-col md:flex-row items-start gap-4">
                <div class="w-24 h-24 bg-gray-700 rounded-lg flex items-center justify-center text-3xl flex-shrink-0">
                    ${getFoodEmoji(entry.food_name)}
                </div>
                <div class="flex-grow">
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="text-xl font-bold text-white">${entry.food_name}</h3>
                            <p class="text-sm text-gray-400">${date}</p>
                        </div>
                        <div class="text-right">
                            <div class="text-2xl font-bold ${match >= 75 ? 'text-secondary' : match >= 50 ? 'text-warning' : 'text-danger'}">${match}%</div>
                            <div class="text-xs text-gray-400">Match</div>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 text-xs text-center">
                        <div class="bg-gray-800 p-2 rounded"><strong>${analysis.calories || 'N/A'}</strong> kcal</div>
                        <div class="bg-gray-800 p-2 rounded"><strong>${analysis.protein || 'N/A'}g</strong> Protein</div>
                        <div class="bg-gray-800 p-2 rounded"><strong>${analysis.carbs || 'N/A'}g</strong> Carbs</div>
                        <div class="bg-gray-800 p-2 rounded"><strong>${analysis.fats || 'N/A'}g</strong> Fat</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderPagination(pagination) {
    const paginationContainer = document.getElementById('pagination');
    if (!pagination || pagination.pages <= 1) {
        paginationContainer.classList.add('hidden');
        return;
    }

    paginationContainer.classList.remove('hidden');
    let html = '';
    for (let i = 1; i <= pagination.pages; i++) {
        html += `
            <button 
                onclick="loadHistory(${i})" 
                class="px-4 py-2 rounded-lg ${i === pagination.page ? 'bg-primary text-white' : 'bg-cardbg text-gray-300 hover:bg-gray-700'}">
                ${i}
            </button>
        `;
    }
    paginationContainer.innerHTML = html;
}

async function exportData() {
    try {
        const response = await fetch('/api/history?limit=1000'); // Export up to 1000 entries
        const result = await response.json();

        if (!result.success) throw new Error(result.message);

        let csv = 'Date,Food,Match (%),Calories,Protein (g),Carbs (g),Fats (g)\n';
        result.history.forEach(entry => {
            const analysis = entry.analysis_result || {};
            csv += `"${new Date(entry.created_at).toLocaleString()}","${entry.food_name}",${entry.match_percentage},${analysis.calories || 0},${analysis.protein || 0},${analysis.carbs || 0},${analysis.fats || 0}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nutriscan-history-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

    } catch (error) {
        console.error('Error exporting data:', error);
        alert('Failed to export data.');
    }
}

async function clearHistory() {
    if (!confirm('Are you sure you want to clear your entire analysis history? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch('/api/history/clear', { method: 'DELETE' });
        const result = await response.json();

        if (result.success) {
            alert('History cleared successfully.');
            loadHistory();
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('Error clearing history:', error);
        alert('Failed to clear history.');
    }
}

async function logout() {
    try {
        const response = await fetch('/logout', { method: 'POST' });
        const result = await response.json();
        if (result.success) {
            window.location.href = result.redirect;
        } else {
            alert('Logout failed.');
        }
    } catch (error) {
        console.error('Logout error:', error);
        alert('Logout failed.');
    }
}

function getFoodEmoji(foodName) {
    if (!foodName) return '🍽️';
    const lowerCaseFood = foodName.toLowerCase();
    if (lowerCaseFood.includes('chicken')) return '🍗';
    if (lowerCaseFood.includes('salad')) return '🥗';
    if (lowerCaseFood.includes('burger')) return '🍔';
    if (lowerCaseFood.includes('vegetable')) return '🥦';
    if (lowerCaseFood.includes('rice')) return '🍚';
    if (lowerCaseFood.includes('fruit')) return '🍎';
    if (lowerCaseFood.includes('fish')) return '🐟';
    return '🍽️';
}