
let allVehicles = [];
let activeMakeFilter = null;
let selectedVehicle = null;

document.addEventListener('DOMContentLoaded', () => {
    loadVehicles();
    setupEventListeners();
});

async function loadVehicles() {
    try {
        const response = await fetch('assets/data/vehicles.json');
        if (!response.ok) throw new Error('Failed to load vehicle data');
        allVehicles = await response.json();
        renderVehicles(allVehicles);
    } catch (error) {
        console.error('Error loading vehicles:', error);
        document.getElementById('vehicle-grid').innerHTML = '<p class="text-center text-red-500">Failed to load inventory. Please try again later.</p>';
    }
}

function renderVehicles(vehicles) {
    const grid = document.getElementById('vehicle-grid');
    const countElement = document.getElementById('vehicle-count');

    if (countElement) {
        countElement.innerHTML = `<strong class="text-slate-900 dark:text-white">${vehicles.length}</strong> Vehicles Available`;
    }

    grid.innerHTML = vehicles.map(vehicle => `
        <div class="group bg-white dark:bg-surface-dark rounded-xl overflow-hidden border border-slate-200 dark:border-metallic hover:shadow-2xl hover:shadow-primary/10 transition-all cursor-pointer" onclick="openVehicleDetails(${vehicle.id})">
            <div class="relative h-64 overflow-hidden">
                <img alt="${vehicle.make} ${vehicle.model}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src="${vehicle.thumbnail}"/>
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div class="absolute top-4 left-4 flex gap-2">
                    ${vehicle.tags.map(tag => {
                        let colorClass = 'bg-primary';
                        if (tag.includes('Safety')) colorClass = 'bg-emerald-600';
                        if (tag.includes('Reserved')) colorClass = 'bg-action-blue';
                        return `<span class="${colorClass} text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-tighter">${tag}</span>`;
                    }).join('')}
                </div>
                <div class="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                    <div>
                        <h4 class="text-white text-xl font-black uppercase tracking-tighter leading-none mb-1">${vehicle.make} ${vehicle.model}</h4>
                        <p class="text-primary text-sm font-bold">${vehicle.year} • ${vehicle.mileage.toLocaleString()} Miles</p>
                    </div>
                    <div class="text-right">
                        <p class="text-white text-lg font-black tracking-tight">L.E${vehicle.price.toLocaleString()}</p>
                    </div>
                </div>
            </div>
            <div class="p-5 space-y-4">
                <div class="grid grid-cols-3 gap-4 py-2 border-b border-slate-100 dark:border-metallic">
                    ${vehicle.specs.slice(0, 3).map((spec, index) => `
                        <div class="text-center ${index === 1 ? 'border-x border-slate-100 dark:border-metallic' : ''}">
                            <p class="text-[10px] font-bold text-slate-400 uppercase">${spec.label}</p>
                            <p class="text-sm font-black">${spec.value}</p>
                        </div>
                    `).join('')}
                </div>
                <div class="flex items-center justify-between py-1">
                    <label class="flex items-center gap-2 cursor-pointer group/toggle">
                        <div class="relative w-8 h-4 bg-slate-200 dark:bg-metallic rounded-full transition-colors group-hover/toggle:bg-action-blue/30">
                            <div class="absolute left-0.5 top-0.5 size-3 bg-white dark:bg-neutral-400 rounded-full transition-all"></div>
                        </div>
                        <span class="text-xs font-bold text-slate-500 uppercase">Compare</span>
                    </label>
                    <div class="flex gap-2">
                        <button class="p-2 rounded-lg bg-slate-100 dark:bg-metallic hover:text-primary transition-colors">
                            <span class="material-symbols-outlined text-lg">favorite</span>
                        </button>
                        <button class="p-2 rounded-lg bg-slate-100 dark:bg-metallic hover:text-action-blue transition-colors">
                            <span class="material-symbols-outlined text-lg">share</span>
                        </button>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <button class="w-full bg-action-blue text-white py-3 rounded-lg text-xs font-black uppercase tracking-widest hover:brightness-110 shadow-lg shadow-action-blue/20 transition-all" onclick="event.stopPropagation(); openVehicleDetails(${vehicle.id})">
                        View Details
                    </button>
                    <button class="w-full border-2 border-slate-200 dark:border-metallic hover:border-primary py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all" onclick="event.stopPropagation()">
                        Test Drive
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function openVehicleDetails(vehicleId) {
    selectedVehicle = allVehicles.find(v => v.id === vehicleId);
    if (!selectedVehicle) return;

    const modal = document.getElementById('vehicle-modal') || createVehicleModal();
    updateModalContent();
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
}

function createVehicleModal() {
    const modal = document.createElement('div');
    modal.id = 'vehicle-modal';
    modal.className = 'hidden fixed inset-0 bg-black/50 z-50 overflow-y-auto backdrop-blur-sm';
    modal.innerHTML = `
        <div class="flex items-center justify-center min-h-screen p-4">
            <div class="bg-white dark:bg-surface-dark rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
                <button onclick="closeVehicleModal()" class="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-metallic rounded-lg z-10">
                    <span class="material-symbols-outlined">close</span>
                </button>
                
                <div id="modal-content"></div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeVehicleModal();
    });
    return modal;
}

function updateModalContent() {
    if (!selectedVehicle) return;
    
    const v = selectedVehicle;
    const contentDiv = document.getElementById('modal-content');
    
    contentDiv.innerHTML = `
        <div class="p-6">
            <!-- Main Image Gallery -->
            <div class="mb-6">
                <div class="relative">
                    <img id="main-image" src="${v.images[0]}" alt="${v.make} ${v.model}" class="w-full h-96 object-cover rounded-xl mb-4"/>
                    <div class="flex gap-2 overflow-x-auto pb-2">
                        ${v.images.map((img, idx) => `
                            <img src="${img}" alt="View ${idx + 1}" class="h-20 w-28 object-cover rounded cursor-pointer hover:opacity-75 transition-opacity ${idx === 0 ? 'ring-2 ring-primary' : ''}" onclick="document.getElementById('main-image').src = '${img}'; document.querySelectorAll('#modal-content img').forEach(i => i.classList.remove('ring-2', 'ring-primary')); event.target.classList.add('ring-2', 'ring-primary');"/>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- Header -->
            <div class="mb-6 pb-4 border-b border-slate-200 dark:border-metallic">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h2 class="text-3xl font-black text-slate-900 dark:text-white mb-2">${v.make} ${v.model}</h2>
                        <div class="flex gap-2">
                            ${v.tags.map(tag => {
                                let colorClass = 'bg-primary';
                                if (tag.includes('Safety')) colorClass = 'bg-emerald-600';
                                if (tag.includes('Reserved')) colorClass = 'bg-action-blue';
                                return `<span class="${colorClass} text-white text-xs font-black px-3 py-1 rounded uppercase">${tag}</span>`;
                            }).join('')}
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="text-4xl font-black text-primary">L.E${v.price.toLocaleString()}</p>
                        <p class="text-sm text-slate-500">${v.year} • ${v.mileage.toLocaleString()} miles</p>
                    </div>
                </div>
            </div>

            <!-- Full Specifications -->
            <div class="mb-6">
                <h3 class="text-xl font-black text-slate-900 dark:text-white mb-4">Specifications</h3>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                    ${v.specs.map(spec => `
                        <div class="p-4 bg-slate-50 dark:bg-metallic rounded-lg">
                            <p class="text-xs font-bold text-slate-500 uppercase mb-1">${spec.label}</p>
                            <p class="text-lg font-black text-slate-900 dark:text-white">${spec.value}</p>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3">
                <button class="flex-1 bg-action-blue text-white py-4 rounded-lg font-bold uppercase tracking-widest hover:brightness-110 shadow-lg shadow-action-blue/20 transition-all">
                    Schedule Test Drive
                </button>
                <button class="flex-1 border-2 border-slate-200 dark:border-metallic py-4 rounded-lg font-bold uppercase tracking-widest hover:border-primary transition-all">
                    Contact Dealer
                </button>
            </div>
        </div>
    `;
}

function closeVehicleModal() {
    const modal = document.getElementById('vehicle-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = 'auto';
    }
}


function setupEventListeners() {
    // Search Filter
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterVehicles(e.target.value, activeMakeFilter);
        });
    }

    // Make Filter
    const makeFilters = document.querySelectorAll('.filter-make');
    makeFilters.forEach(button => {
        button.addEventListener('click', () => {
            const make = button.getAttribute('data-make');

            // Toggle active state logic
            if (activeMakeFilter === make) {
                activeMakeFilter = null; // Deselect
                button.classList.remove('bg-primary', 'text-white');
                button.classList.add('bg-slate-100', 'dark:bg-surface-dark', 'hover:bg-slate-200', 'dark:hover:bg-metallic');
            } else {
                // Remove active class from all
                makeFilters.forEach(btn => {
                    btn.classList.remove('bg-primary', 'text-white');
                    btn.classList.add('bg-slate-100', 'dark:bg-surface-dark', 'hover:bg-slate-200', 'dark:hover:bg-metallic');
                });

                activeMakeFilter = make; // Select new
                button.classList.remove('bg-slate-100', 'dark:bg-surface-dark', 'hover:bg-slate-200', 'dark:hover:bg-metallic');
                button.classList.add('bg-primary', 'text-white');
            }

            filterVehicles(searchInput ? searchInput.value : '', activeMakeFilter);
        });
    });

    // Reset Button
    const resetBtn = document.getElementById('reset-filters');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            activeMakeFilter = null;
            makeFilters.forEach(btn => {
                btn.classList.remove('bg-primary', 'text-white');
                btn.classList.add('bg-slate-100', 'dark:bg-surface-dark', 'hover:bg-slate-200', 'dark:hover:bg-metallic');
            });
            renderVehicles(allVehicles);
        });
    }
}

function filterVehicles(searchTerm, make) {
    const term = searchTerm.toLowerCase();

    const filtered = allVehicles.filter(vehicle => {
        const matchesSearch =
            vehicle.make.toLowerCase().includes(term) ||
            vehicle.model.toLowerCase().includes(term) ||
            vehicle.year.toString().includes(term);

        const matchesMake = make ? vehicle.make === make : true;

        return matchesSearch && matchesMake;
    });

    renderVehicles(filtered);
}
