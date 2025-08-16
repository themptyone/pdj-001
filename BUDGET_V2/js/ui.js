// js/ui.js

// IMPORTANT: This function is MODIFIED to load HTML from files
async function showPage(pageId) {
    const pageContent = document.getElementById('page-content');
    try {
        console.log(`Loading page: ${pageId}`);
        const response = await fetch(`pages/${pageId}.html`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const html = await response.text();
        console.log(`Page content loaded, length: ${html.length}`);
        pageContent.innerHTML = html;
        // After loading the page, we need to re-render the data into it
        console.log('Calling renderAll...');
        renderAll();
        console.log('Page loaded successfully');
    } catch (error) {
        console.error('Error loading page:', error);
        pageContent.innerHTML = `
            <h1 class="page-title">Error: Could not load page.</h1>
            <p>Failed to load: <strong>${pageId}</strong></p>
            <p>Error: ${error.message}</p>
            <p>Please check the console for more details.</p>
        `;
    }
}

function initializeNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            if(e.target.classList.contains('logout-btn')) return;

            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            e.target.classList.add('active');
            
            const pageId = e.target.getAttribute('data-page');
            showPage(pageId);
        });
    });
}

function openModal(modalId) { 
    if (modalId === 'expense-modal') { populateCategoryDropdown(); }
    document.getElementById(modalId).classList.add('active'); 
}
function closeModal(modalId) { document.getElementById(modalId).classList.remove('active'); }

function openActionMenu(event, type, id) {
    event.stopPropagation();
    const menu = document.getElementById('action-menu');
    currentActionItem = { type, id };
    
    const item = data[type].find(i => i.id === id);
    document.getElementById('action-menu-hide').textContent = item.isHidden ? 'Unhide' : 'Hide';
    document.getElementById('action-menu-pay').style.display = type === 'debts' ? 'block' : 'none';


    menu.style.display = 'block';
    menu.style.top = `${event.pageY + 10}px`;
    menu.style.left = `${event.pageX - 100}px`;

    document.getElementById('action-menu-delete').onclick = () => { deleteItem(type, id); menu.style.display = 'none'; };
    document.getElementById('action-menu-hide').onclick = () => { toggleHidden(type, id); menu.style.display = 'none'; };
    document.getElementById('action-menu-edit').onclick = () => { openEditModal(type, id); menu.style.display = 'none'; };
    document.getElementById('action-menu-pay').onclick = () => { openPaymentModal(id); menu.style.display = 'none'; };
}

function togglePieChart() { 
    const chartContainer = document.getElementById('pieChartContainer'); 
    const summaryGrid = document.getElementById('category-summary-grid'); 
    const isChecked = document.getElementById('chart-toggle').checked; 
    chartContainer.style.display = isChecked ? 'block' : 'none'; 
    summaryGrid.style.display = isChecked ? 'none' : 'grid'; 
    if (isChecked) renderAll(); 
}

function updateActiveTimeFilterButton() {
    const controls = document.getElementById('time-filter-controls');
    controls.querySelectorAll('.btn').forEach(btn => btn.classList.remove('active'));
    const activeButton = controls.querySelector(`[onclick="setTimeFilter('${data.settings.timePeriod}')"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
}

// Global click listener for closing modals and menus
window.addEventListener('click', e => { 
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
    const actionMenu = document.getElementById('action-menu');
    if (!actionMenu.contains(e.target) && !e.target.closest('.action-btn')) {
        actionMenu.style.display = 'none';
    }
});