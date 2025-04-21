// Global variables
let map;
let lotLayers = {};
let currentSelectedLot = null;
let geojsonData = null;

// Initialize the map
function initMap() {
    // Create map centered at the specified coordinates with zoom level 16
    map = L.map('map', {
        center: [9.581195, -84.537217],
        zoom: 15,
        minZoom: 14,
        maxZoom: 18
    });

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        tileSize: 512,
        zoomOffset: -1
    }).addTo(map);

    // Load GeoJSON data
    loadGeoJSON();
}

// Load GeoJSON data from the static file
function loadGeoJSON() {
    fetch('data/lots.json')
        .then(response => response.json())
        .then(data => {
            geojsonData = data;
            addGeoJSONToMap(data);
        })
        .catch(error => {
            console.error('Error loading GeoJSON:', error);
            document.getElementById('lot-info').innerHTML =
                `<div class="alert alert-danger">
                    Error loading property data. Please try refreshing the page.
                </div>`;
        });
}

// Add GeoJSON data to the map
function addGeoJSONToMap(data) {
    // Create GeoJSON layer
    const geoJsonLayer = L.geoJSON(data, {
        style: function(feature) {
            // Default style for lots
            return {
                fillColor: getColorByStatus(feature.properties.status),
                weight: 2,
                opacity: 1,
                color: 'white',
                dashArray: '3',
                fillOpacity: 0.5
            };
        },
        onEachFeature: onEachFeature
    }).addTo(map);

    // Add lot number labels
    const labelGroup = L.layerGroup().addTo(map);
    data.features.forEach(feature => {
        const center = L.geoJSON(feature).getBounds().getCenter();
        const lotNumber = feature.properties.name.replace('Lot ', '');
        L.marker(center, {
            icon: L.divIcon({
                className: 'lot-label',
                html: lotNumber,
                iconSize: [16, 16]
            })
        }).addTo(labelGroup);
    });

    // Show/hide labels based on zoom level
    map.on('zoomend', () => {
        const zoom = map.getZoom();
        if (zoom < 15) {
            labelGroup.remove();
        } else {
            labelGroup.addTo(map);
        }
    });

    // Fit map bounds to show all lots
    map.fitBounds(geoJsonLayer.getBounds());

    // Select lot 47 initially
    const lot47Layer = lotLayers['Lot 47'];
    if (lot47Layer) {
        selectLot({ target: lot47Layer });
    }
}

// Function that defines what happens when interacting with each feature
function onEachFeature(feature, layer) {
    // Store reference to layer
    lotLayers[feature.properties.name] = layer;

    // Add popups
    layer.bindPopup(`<b>${feature.properties.name}</b>`);

    // Add event listeners
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: selectLot
    });
}

// Function to highlight feature on mouseover
function highlightFeature(e) {
    const layer = e.target;

    // Skip if this is the currently selected lot
    if (currentSelectedLot === layer) return;

    layer.setStyle({
        weight: 3,
        color: '#66b3ff',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
}

// Function to reset highlight on mouseout
function resetHighlight(e) {
    const layer = e.target;

    // Skip if this is the currently selected lot
    if (currentSelectedLot === layer) return;

    // Reset to default style
    const feature = layer.feature;
    layer.setStyle({
        fillColor: getColorByStatus(feature.properties.status),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.5
    });
}

// Function to select a lot when clicked
function selectLot(e) {
    const layer = e.target;
    const feature = layer.feature;

    // If clicking the same lot, do nothing
    if (currentSelectedLot === layer) {
        return;
    }

    // Reset style of previously selected lot and remove selection
    if (currentSelectedLot) {
        currentSelectedLot.setStyle({
            fillColor: getColorByStatus(currentSelectedLot.feature.properties.status),
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.5
        });
        currentSelectedLot.closePopup();
    }

    // Set style for newly selected lot
    layer.setStyle({
        weight: 4,
        color: '#4dff4d',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }

    // Update current selected lot
    currentSelectedLot = layer;

    // Update lot information panel
    updateLotInfo(feature);

    // Open popup
    layer.openPopup();
}

// Function to update lot information panel
function updateLotInfo(feature) {
    const properties = feature.properties;
    const lotName = properties.name;
    const status = properties.status || 'Not for sale';
    const contact = properties.contact || 'Contact information not available';
    const price = properties['price ind.'] ? `$${properties['price ind.'].toLocaleString()}` : 'Price not available';

    // Generate sample images for the lot (in real-world app, these would be real images)
    const lotImages = generateSampleImageLinks(lotName);

    // Update the lot information panel
    document.getElementById('lot-title').textContent = lotName;

    // Create HTML for lot information
    let lotInfoHTML = `
        <div class="photo-gallery mb-4">
            <div class="gallery-container">
                <div class="gallery-scroll">
                    ${lotImages.map((image, index) => `
                        <div class="gallery-item">
                            <img src="${image.url}" alt="${image.caption}" class="gallery-image">
                        </div>
                    `).join('')}
                </div>
                <button class="gallery-nav prev" onclick="scrollGallery(-1)"><i class="fas fa-chevron-left"></i></button>
                <button class="gallery-nav next" onclick="scrollGallery(1)"><i class="fas fa-chevron-right"></i></button>
            </div>
        </div>
        <div class="lot-details mb-4">
            <div class="d-flex justify-content-between mb-3">
                <span class="badge ${status === 'For sale' ? 'bg-success' : 'bg-secondary'} fs-6">${status}</span>
                <span class="badge bg-info fs-6">${price}</span>
            </div>
            
            <h4>Property Details</h4>
            <ul class="list-group mb-4">
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <span><i class="fas fa-map me-2"></i>Location</span>
                    <span>Columbus Heights Estate, Costa Rica</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <span><i class="fas fa-ruler-combined me-2"></i>Land Size</span>
                    <span>Approx. ${(Math.random() * (1.5 - 0.5) + 0.5).toFixed(2)} acres</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <span><i class="fas fa-mountain me-2"></i>Terrain</span>
                    <span>Mountainous with valley views</span>
                </li>
            </ul>
            
            <h4>Contact Information</h4>
            <p><i class="fas fa-user me-2"></i>${contact}</p>
            
            </div>
        
        <div class="property-description">
            <h4>Description</h4>
            <p>This beautiful lot is located in the exclusive Columbus Heights Estate development in Costa Rica. The property offers stunning mountain and ocean views, perfect for building your dream home.</p>
            <p>The lot offers privacy while still being close to amenities. Access to community water and a well-maintained access road is included.</p>
        </div>
    `;

    document.getElementById('lot-info').innerHTML = lotInfoHTML;
}

// Function to get color based on lot status
function getColorByStatus(status) {
    if (!status) return '#bdbdbd'; // Grey for no status
    if (status === 'For sale') return '#ffd600'; // Yellow for for sale
    return '#bdbdbd'; // Default grey
}

// Function to generate sample image links for lots
function generateSampleImageLinks(lotName) {
    // In a real application, these would be real image URLs
    return [
        { url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef', caption: `${lotName} - Mountain View` },
        { url: 'https://images.unsplash.com/photo-1513001900722-370f803f498d', caption: `${lotName} - Aerial View` },
        { url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233', caption: `${lotName} - Surrounding Area` }
    ];
}

// Function to open image gallery modal
function openImageGallery(lotName) {
    const images = generateSampleImageLinks(lotName);
    const carouselInner = document.getElementById('carouselInner');
    carouselInner.innerHTML = '';

    // Add images to carousel
    images.forEach((image, index) => {
        const div = document.createElement('div');
        div.className = `carousel-item ${index === 0 ? 'active' : ''}`;
        div.innerHTML = `
            <img src="${image.url}" class="d-block w-100" alt="${image.caption}">
            <div class="carousel-caption d-none d-md-block">
                <h5>${image.caption}</h5>
            </div>
        `;
        carouselInner.appendChild(div);
    });

    // Update modal title
    document.getElementById('lotImagesModalLabel').textContent = `${lotName} - Images`;

    // Open modal
    const modal = new bootstrap.Modal(document.getElementById('lotImagesModal'));
    modal.show();
}

// Initialize map when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initMap);

// Make the openImageGallery function available globally
window.openImageGallery = openImageGallery;
function scrollGallery(direction) {
    const gallery = document.querySelector('.gallery-scroll');
    const scrollAmount = gallery.offsetWidth;
    gallery.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
}
