
let allVehicles = [];
let activeMakeFilter = null;
let activeBodyStyleFilter = null;
let activeSortFilter = 'popularity';
let selectedVehicle = null;
let compareList = [];
let favorites = JSON.parse(localStorage.getItem('ghalyMotorsFavorites')) || [];

document.addEventListener('DOMContentLoaded', () => {
    loadVehicles();
    setupEventListeners();
    createModals();
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

    grid.innerHTML = vehicles.map(vehicle => {
        const isFavorite = favorites.includes(vehicle.id);
        const isCompared = compareList.includes(vehicle.id);
        return `
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
                    <label class="flex items-center gap-2 cursor-pointer group/toggle" onclick="event.stopPropagation()">
                        <input type="checkbox" class="hidden compare-checkbox" data-id="${vehicle.id}" ${isCompared ? 'checked' : ''} onchange="toggleCompare(${vehicle.id})"/>
                        <div class="relative w-8 h-4 bg-slate-200 dark:bg-metallic rounded-full transition-colors group-hover/toggle:bg-action-blue/30 ${isCompared ? 'bg-primary' : ''}">
                            <div class="absolute left-0.5 top-0.5 size-3 bg-white dark:bg-neutral-400 rounded-full transition-all ${isCompared ? 'translate-x-4' : ''}"></div>
                        </div>
                        <span class="text-xs font-bold text-slate-500 uppercase">Compare</span>
                    </label>
                    <div class="flex gap-2">
                        <button class="p-2 rounded-lg bg-slate-100 dark:bg-metallic hover:text-primary transition-colors ${isFavorite ? 'text-red-500' : ''}" onclick="event.stopPropagation(); toggleFavorite(${vehicle.id})" title="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
                            <span class="material-symbols-outlined text-lg">${isFavorite ? 'favorite' : 'favorite'}</span>
                        </button>
                        <button class="p-2 rounded-lg bg-slate-100 dark:bg-metallic hover:text-action-blue transition-colors" onclick="event.stopPropagation(); shareVehicle(${vehicle.id})" title="Share this car">
                            <span class="material-symbols-outlined text-lg">share</span>
                        </button>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <button class="w-full bg-action-blue text-white py-3 rounded-lg text-xs font-black uppercase tracking-widest hover:brightness-110 shadow-lg shadow-action-blue/20 transition-all" onclick="event.stopPropagation(); openVehicleDetails(${vehicle.id})">
                        View Details
                    </button>
                    <button class="w-full border-2 border-slate-200 dark:border-metallic hover:border-primary py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all" onclick="event.stopPropagation(); openTestDriveModal(${vehicle.id})" title="Schedule a test drive">
                        Test Drive
                    </button>
                </div>
            </div>
        </div>
    `;
    }).join('');

    // Update compare UI after rendering vehicles
    updateCompareUI();
}

function openVehicleDetails(vehicleId) {
    selectedVehicle = allVehicles.find(v => v.id === vehicleId);
    if (!selectedVehicle) return;

    const modal = document.getElementById('vehicle-modal') || createVehicleModal();
    updateModalContent();
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function createVehicleModal() {
    const modal = document.createElement('div');
    modal.id = 'vehicle-modal';
    modal.className = 'hidden fixed inset-0 z-50 overflow-hidden';
    modal.innerHTML = `
        <div class="fixed inset-0 bg-black/30 backdrop-blur-sm" onclick="closeVehicleModal()"></div>
        <div class="fixed right-0 top-0 h-full w-full md:w-2/3 lg:w-1/2 bg-white dark:bg-surface-dark overflow-y-auto shadow-2xl">
            <button onclick="closeVehicleModal()" class="sticky top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-metallic rounded-lg float-right">
                <span class="material-symbols-outlined">close</span>
            </button>
            
            <div id="modal-content" class="clear-both"></div>
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
            <div class="flex gap-3 mb-6">
                <button class="flex-1 bg-action-blue text-white py-4 rounded-lg font-bold uppercase tracking-widest hover:brightness-110 shadow-lg shadow-action-blue/20 transition-all" onclick="event.stopPropagation(); openTestDriveModal(${v.id})">
                    Schedule Test Drive
                </button>
                <button class="flex-1 border-2 border-slate-200 dark:border-metallic py-4 rounded-lg font-bold uppercase tracking-widest hover:border-primary transition-all" onclick="event.stopPropagation(); openContactModal(${v.id})">
                    Contact Dealer
                </button>
            </div>

            <!-- Additional Actions -->
            <div class="flex gap-2 pb-6">
                <button class="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-slate-100 dark:bg-metallic hover:bg-primary hover:text-white transition-colors font-bold" onclick="event.stopPropagation(); toggleFavorite(${v.id})">
                    <span class="material-symbols-outlined">${favorites.includes(v.id) ? 'favorite' : 'favorite'}</span>
                    ${favorites.includes(v.id) ? 'Saved' : 'Save'}
                </button>
                <button class="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-slate-100 dark:bg-metallic hover:bg-primary hover:text-white transition-colors font-bold" onclick="event.stopPropagation(); shareVehicle(${v.id})">
                    <span class="material-symbols-outlined">share</span>
                    Share
                </button>
            </div>
        </div>
    `;
}

function closeVehicleModal() {
    const modal = document.getElementById('vehicle-modal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
}

// Favorites functionality
function toggleFavorite(vehicleId) {
    const index = favorites.indexOf(vehicleId);
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(vehicleId);
    }
    localStorage.setItem('ghalyMotorsFavorites', JSON.stringify(favorites));
    renderVehicles(allVehicles);
    
    // Show toast notification
    showToast(index > -1 ? 'Removed from favorites' : 'Added to favorites');
}

// Compare functionality
function toggleCompare(vehicleId) {
    const index = compareList.indexOf(vehicleId);
    if (index > -1) {
        compareList.splice(index, 1);
    } else {
        if (compareList.length >= 3) {
            showToast('You can compare up to 3 vehicles', 'error');
            return;
        }
        compareList.push(vehicleId);
    }
    updateCompareUI();
    renderVehicles(allVehicles);
    updateCompareButton();
    showToast(index > -1 ? 'Removed from comparison' : 'Added to comparison');
}

function updateCompareUI() {
    const compareContainer = document.querySelector('.flex.items-center.gap-6.overflow-x-auto');
    if (!compareContainer) return;

    // Get all the slot divs in the first child container
    const slotsContainer = compareContainer.querySelector('.flex.items-center.gap-3');
    if (!slotsContainer) return;

    // Remove all existing vehicle cards
    const existingCards = slotsContainer.querySelectorAll('[data-compare-slot]');
    existingCards.forEach(card => card.remove());

    // Add selected vehicles to compare bar
    let slotIndex = 0;
    compareList.forEach((vehicleId) => {
        const vehicle = allVehicles.find(v => v.id === vehicleId);
        if (!vehicle) return;

        const slot = document.createElement('div');
        slot.setAttribute('data-compare-slot', slotIndex++);
        slot.className = 'flex items-center gap-3';
        slot.innerHTML = `
            <div class="size-12 rounded bg-slate-200 dark:bg-metallic overflow-hidden border border-action-blue relative group">
                <img alt="${vehicle.make} ${vehicle.model}" class="w-full h-full object-cover" src="${vehicle.thumbnail}"/>
                <button onclick="event.stopPropagation(); toggleCompare(${vehicle.id})" class="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded">
                    <span class="material-symbols-outlined text-white text-lg">close</span>
                </button>
            </div>
            <div class="hidden sm:block">
                <p class="text-[10px] font-black uppercase text-action-blue">Selected</p>
                <p class="text-xs font-bold truncate max-w-[120px]">${vehicle.make} ${vehicle.model}</p>
            </div>
        `;
        slotsContainer.appendChild(slot);
    });

    // Add empty slots for remaining comparison spots
    const remainingSlots = 3 - compareList.length;
    for (let i = 0; i < remainingSlots; i++) {
        const emptySlot = document.createElement('div');
        emptySlot.className = 'size-12 rounded border-2 border-dashed border-slate-300 dark:border-metallic flex items-center justify-center text-slate-400';
        emptySlot.innerHTML = '<span class="material-symbols-outlined text-sm">add</span>';
        slotsContainer.appendChild(emptySlot);
    }

    // Update compare button text and state
    const compareBtn = document.getElementById('compare-bottom-btn');
    if (compareBtn) {
        compareBtn.textContent = `Compare Now (${compareList.length})`;
        compareBtn.disabled = compareList.length < 2;
    }
}

function updateCompareButton() {
    const compareBtn = document.getElementById('compare-btn');
    if (compareBtn) {
        compareBtn.textContent = `Compare (${compareList.length})`;
        compareBtn.disabled = compareList.length < 2;
    }
}

function openCompareModal() {
    if (compareList.length < 2) {
        showToast('Select at least 2 vehicles to compare', 'error');
        return;
    }
    
    const vehiclesToCompare = allVehicles.filter(v => compareList.includes(v.id));
    const modal = document.getElementById('compare-modal') || createCompareModal();
    
    const allSpecs = [...new Set(vehiclesToCompare.flatMap(v => v.specs.map(s => s.label)))];
    
    let compareHTML = `
        <div class="p-6">
            <h2 class="text-3xl font-black text-slate-900 dark:text-white mb-6">Compare Vehicles</h2>
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="border-b-2 border-slate-200 dark:border-metallic">
                            <th class="text-left p-4 font-black text-slate-900 dark:text-white">Feature</th>
                            ${vehiclesToCompare.map(v => `
                                <th class="text-left p-4">
                                    <div class="font-black text-slate-900 dark:text-white">${v.make} ${v.model}</div>
                                    <div class="text-sm text-primary font-bold">L.E${v.price.toLocaleString()}</div>
                                </th>
                            `).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${allSpecs.map(specLabel => `
                            <tr class="border-b border-slate-100 dark:border-metallic hover:bg-slate-50 dark:hover:bg-metallic/30">
                                <td class="p-4 font-bold text-slate-700 dark:text-slate-300">${specLabel}</td>
                                ${vehiclesToCompare.map(v => {
                                    const spec = v.specs.find(s => s.label === specLabel);
                                    return `<td class="p-4 text-slate-600 dark:text-slate-400">${spec ? spec.value : 'N/A'}</td>`;
                                }).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div class="mt-6 flex gap-3">
                <button class="flex-1 bg-action-blue text-white py-3 rounded-lg font-bold" onclick="clearCompare()">Clear Comparison</button>
                <button class="flex-1 border-2 border-action-blue text-action-blue py-3 rounded-lg font-bold" onclick="closeCompareModal()">Close</button>
            </div>
        </div>
    `;
    
    document.getElementById('compare-content').innerHTML = compareHTML;
    modal.classList.remove('hidden');
}

function createCompareModal() {
    const modal = document.createElement('div');
    modal.id = 'compare-modal';
    modal.className = 'hidden fixed inset-0 z-50 overflow-hidden';
    modal.innerHTML = `
        <div class="fixed inset-0 bg-black/30 backdrop-blur-sm" onclick="closeCompareModal()"></div>
        <div class="fixed right-0 top-0 h-full w-full md:w-2/3 lg:w-1/2 bg-white dark:bg-surface-dark overflow-y-auto shadow-2xl">
            <button onclick="closeCompareModal()" class="sticky top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-metallic rounded-lg float-right">
                <span class="material-symbols-outlined">close</span>
            </button>
            <div id="compare-content" class="clear-both"></div>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

function closeCompareModal() {
    const modal = document.getElementById('compare-modal');
    if (modal) modal.classList.add('hidden');
}

function clearCompare() {
    compareList = [];
    renderVehicles(allVehicles);
    updateCompareButton();
    closeCompareModal();
    showToast('Comparison cleared');
}

// Share functionality
function shareVehicle(vehicleId) {
    const vehicle = allVehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;
    
    const shareText = `Check out this ${vehicle.year} ${vehicle.make} ${vehicle.model} for L.E${vehicle.price.toLocaleString()} at Ghaly Motors!`;
    const shareUrl = `${window.location.origin}${window.location.pathname}?car=${vehicleId}`;
    
    if (navigator.share) {
        navigator.share({
            title: `${vehicle.make} ${vehicle.model}`,
            text: shareText,
            url: shareUrl
        }).catch(err => console.log('Error sharing:', err));
    } else {
        // Fallback: Copy to clipboard
        const fullText = `${shareText}\n${shareUrl}`;
        navigator.clipboard.writeText(fullText).then(() => {
            showToast('Link copied to clipboard!');
        });
    }
}

// Test Drive modal
function openTestDriveModal(vehicleId) {
    selectedVehicle = allVehicles.find(v => v.id === vehicleId);
    const modal = document.getElementById('test-drive-modal') || createTestDriveModal();
    
    const testDriveForm = document.getElementById('test-drive-form');
    if (testDriveForm) {
        testDriveForm.innerHTML = `
            <div class="p-6">
                <h2 class="text-2xl font-black text-slate-900 dark:text-white mb-2">Schedule Test Drive</h2>
                <p class="text-slate-600 dark:text-slate-400 mb-6">${selectedVehicle.make} ${selectedVehicle.model} (${selectedVehicle.year})</p>
                
                <form onsubmit="submitTestDrive(event)" class="space-y-4">
                    <div>
                        <label class="block text-sm font-bold text-slate-900 dark:text-white mb-2">Full Name</label>
                        <input type="text" required class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-metallic dark:bg-metallic/30 dark:text-white focus:outline-none focus:border-primary" placeholder="Your name"/>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-bold text-slate-900 dark:text-white mb-2">Email</label>
                        <input type="email" required class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-metallic dark:bg-metallic/30 dark:text-white focus:outline-none focus:border-primary" placeholder="your@email.com"/>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-bold text-slate-900 dark:text-white mb-2">Phone</label>
                        <input type="tel" required class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-metallic dark:bg-metallic/30 dark:text-white focus:outline-none focus:border-primary" placeholder="Your phone number"/>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-bold text-slate-900 dark:text-white mb-2">Preferred Date</label>
                        <input type="date" required class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-metallic dark:bg-metallic/30 dark:text-white focus:outline-none focus:border-primary"/>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-bold text-slate-900 dark:text-white mb-2">Preferred Time</label>
                        <input type="time" required class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-metallic dark:bg-metallic/30 dark:text-white focus:outline-none focus:border-primary"/>
                    </div>
                    
                    <div class="flex gap-3 pt-4">
                        <button type="submit" class="flex-1 bg-action-blue text-white py-3 rounded-lg font-bold hover:brightness-110 transition-all">
                            Confirm Booking
                        </button>
                        <button type="button" onclick="closeTestDriveModal()" class="flex-1 border-2 border-slate-300 dark:border-metallic py-3 rounded-lg font-bold">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        `;
    }
    
    modal.classList.remove('hidden');
}

function createTestDriveModal() {
    const modal = document.createElement('div');
    modal.id = 'test-drive-modal';
    modal.className = 'hidden fixed inset-0 z-50 overflow-hidden';
    modal.innerHTML = `
        <div class="fixed inset-0 bg-black/30 backdrop-blur-sm" onclick="closeTestDriveModal()"></div>
        <div class="fixed right-0 top-0 h-full w-full md:w-2/3 lg:w-1/2 bg-white dark:bg-surface-dark overflow-y-auto shadow-2xl">
            <button onclick="closeTestDriveModal()" class="sticky top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-metallic rounded-lg float-right">
                <span class="material-symbols-outlined">close</span>
            </button>
            <div id="test-drive-form" class="clear-both"></div>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

function submitTestDrive(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    showToast('Test drive scheduled! We will contact you soon.');
    closeTestDriveModal();
}

function closeTestDriveModal() {
    const modal = document.getElementById('test-drive-modal');
    if (modal) modal.classList.add('hidden');
}

// Contact Dealer modal
function openContactModal(vehicleId) {
    selectedVehicle = allVehicles.find(v => v.id === vehicleId);
    const modal = document.getElementById('contact-modal') || createContactModal();
    
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.innerHTML = `
            <div class="p-6">
                <h2 class="text-2xl font-black text-slate-900 dark:text-white mb-2">Contact Dealer</h2>
                <p class="text-slate-600 dark:text-slate-400 mb-6">${selectedVehicle.make} ${selectedVehicle.model} (${selectedVehicle.year})</p>
                
                <form onsubmit="submitContact(event)" class="space-y-4">
                    <div>
                        <label class="block text-sm font-bold text-slate-900 dark:text-white mb-2">Full Name</label>
                        <input type="text" required class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-metallic dark:bg-metallic/30 dark:text-white focus:outline-none focus:border-primary" placeholder="Your name"/>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-bold text-slate-900 dark:text-white mb-2">Email</label>
                        <input type="email" required class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-metallic dark:bg-metallic/30 dark:text-white focus:outline-none focus:border-primary" placeholder="your@email.com"/>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-bold text-slate-900 dark:text-white mb-2">Phone</label>
                        <input type="tel" required class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-metallic dark:bg-metallic/30 dark:text-white focus:outline-none focus:border-primary" placeholder="Your phone number"/>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-bold text-slate-900 dark:text-white mb-2">Message</label>
                        <textarea required rows="4" class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-metallic dark:bg-metallic/30 dark:text-white focus:outline-none focus:border-primary" placeholder="Your message..."></textarea>
                    </div>
                    
                    <div class="flex gap-3 pt-4">
                        <button type="submit" class="flex-1 bg-action-blue text-white py-3 rounded-lg font-bold hover:brightness-110 transition-all">
                            Send Message
                        </button>
                        <button type="button" onclick="closeContactModal()" class="flex-1 border-2 border-slate-300 dark:border-metallic py-3 rounded-lg font-bold">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        `;
    }
    
    modal.classList.remove('hidden');
}

function createContactModal() {
    const modal = document.createElement('div');
    modal.id = 'contact-modal';
    modal.className = 'hidden fixed inset-0 z-50 overflow-hidden';
    modal.innerHTML = `
        <div class="fixed inset-0 bg-black/30 backdrop-blur-sm" onclick="closeContactModal()"></div>
        <div class="fixed right-0 top-0 h-full w-full md:w-2/3 lg:w-1/2 bg-white dark:bg-surface-dark overflow-y-auto shadow-2xl">
            <button onclick="closeContactModal()" class="sticky top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-metallic rounded-lg float-right">
                <span class="material-symbols-outlined">close</span>
            </button>
            <div id="contact-form" class="clear-both"></div>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

function submitContact(event) {
    event.preventDefault();
    showToast('Message sent! We will contact you soon.');
    closeContactModal();
}

function closeContactModal() {
    const modal = document.getElementById('contact-modal');
    if (modal) modal.classList.add('hidden');
}

// Toast notifications
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-6 right-6 px-6 py-4 rounded-lg text-white font-bold z-50 animate-in fade-in ${type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Create modals on load
function createModals() {
    createCompareModal();
    createTestDriveModal();
    createContactModal();
}


function setupEventListeners() {
    // Search Filter
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            applyAllFilters();
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

            applyAllFilters();
        });
    });

    // Body Style Filter
    const bodyStyleButtons = document.querySelectorAll('button[data-body-style]');
    bodyStyleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const bodyStyle = button.getAttribute('data-body-style');

            if (activeBodyStyleFilter === bodyStyle) {
                activeBodyStyleFilter = null;
                button.classList.remove('bg-primary/10', 'border-primary', 'text-primary');
                button.classList.add('bg-slate-100', 'dark:bg-surface-dark', 'hover:border-primary', 'border-transparent');
            } else {
                // Remove active class from all
                bodyStyleButtons.forEach(btn => {
                    btn.classList.remove('bg-primary/10', 'border-primary', 'text-primary');
                    btn.classList.add('bg-slate-100', 'dark:bg-surface-dark', 'hover:border-primary', 'border-transparent');
                });

                activeBodyStyleFilter = bodyStyle;
                button.classList.remove('bg-slate-100', 'dark:bg-surface-dark', 'hover:border-primary', 'border-transparent');
                button.classList.add('bg-primary/10', 'border-primary', 'text-primary');
            }

            applyAllFilters();
        });
    });

    // Sort Dropdown
    const sortSelect = document.querySelector('select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            const sortValue = e.target.value;
            if (sortValue.includes('Low to High')) activeSortFilter = 'price-low-high';
            else if (sortValue.includes('High to Low')) activeSortFilter = 'price-high-low';
            else if (sortValue.includes('Fuel Economy')) activeSortFilter = 'fuel-economy';
            else if (sortValue.includes('Reliability')) activeSortFilter = 'reliability';
            else activeSortFilter = 'popularity';
            
            applyAllFilters();
        });
    }

    // Reset Button
    const resetBtn = document.getElementById('reset-filters');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            activeMakeFilter = null;
            activeBodyStyleFilter = null;
            activeSortFilter = 'popularity';
            
            makeFilters.forEach(btn => {
                btn.classList.remove('bg-primary', 'text-white');
                btn.classList.add('bg-slate-100', 'dark:bg-surface-dark', 'hover:bg-slate-200', 'dark:hover:bg-metallic');
            });

            bodyStyleButtons.forEach(btn => {
                btn.classList.remove('bg-primary/10', 'border-primary', 'text-primary');
                btn.classList.add('bg-slate-100', 'dark:bg-surface-dark', 'hover:border-primary', 'border-transparent');
            });

            if (sortSelect) sortSelect.value = sortSelect.options[0].value;

            renderVehicles(allVehicles);
        });
    }
}

function applyAllFilters() {
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

    let filtered = allVehicles.filter(vehicle => {
        // Search filter
        const matchesSearch =
            vehicle.make.toLowerCase().includes(searchTerm) ||
            vehicle.model.toLowerCase().includes(searchTerm) ||
            vehicle.year.toString().includes(searchTerm);

        // Make filter
        const matchesMake = activeMakeFilter ? vehicle.make === activeMakeFilter : true;

        // Body style filter (map vehicle type to body style)
        let vehicleBodyStyle = vehicle.type === 'SUV' ? 'SUV' : 
                               vehicle.type === 'Sedan' ? 'Sedan' :
                               vehicle.type === 'Truck' ? 'Truck' : 'Coupe';
        const matchesBodyStyle = activeBodyStyleFilter ? vehicleBodyStyle === activeBodyStyleFilter : true;

        return matchesSearch && matchesMake && matchesBodyStyle;
    });

    // Apply sorting
    filtered = sortVehicles(filtered);

    renderVehicles(filtered);
}

function sortVehicles(vehicles) {
    const sorted = [...vehicles];

    switch(activeSortFilter) {
        case 'price-low-high':
            return sorted.sort((a, b) => a.price - b.price);
        case 'price-high-low':
            return sorted.sort((a, b) => b.price - a.price);
        case 'fuel-economy':
            // Sort by model name (simulated fuel economy proxy)
            return sorted.sort((a, b) => a.model.localeCompare(b.model));
        case 'reliability':
            // Sort by year (newer = more reliable)
            return sorted.sort((a, b) => b.year - a.year);
        case 'popularity':
        default:
            return sorted; // Keep original order
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
