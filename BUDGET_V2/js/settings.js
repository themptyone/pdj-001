// js/settings.js
const themes = {
    'Liquid Glass': { fontFamily: `'Segoe UI', sans-serif`, borderRadius: '20px', boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)', bgImage: 'linear-gradient(135deg, #667eea, #764ba2)', textColorTitle: '#ffffff', accentColorPositive: '#51cf66', accentColorNegative: '#ff6b6b', btnColorPrimary: '#667eea' },
    'To The Moon': { fontFamily: `'Orbitron', sans-serif`, borderRadius: '8px', boxShadow: '0 0 15px #3D52D5', bgImage: 'linear-gradient(to bottom, #000000, #0c0c2c, #181858)', textColorTitle: '#e0e0ff', accentColorPositive: '#00f2ff', accentColorNegative: '#ff4b2b', btnColorPrimary: '#3D52D5' },
    'Solar Flare': { fontFamily: `'Exo 2', sans-serif`, borderRadius: '12px', boxShadow: '0 4px 20px rgba(255, 100, 0, 0.5)', bgImage: 'linear-gradient(45deg, #ff8c00, #ff4500)', textColorTitle: '#fff200', accentColorPositive: '#ffdd00', accentColorNegative: '#d40000', btnColorPrimary: '#ff6600' },
    'Neo-Brutalist': { fontFamily: `'Courier Prime', monospace`, borderRadius: '0px', boxShadow: '8px 8px 0px #000000', bgImage: 'linear-gradient(90deg, #fdfd96 50%, #ff6961 50%)', textColorTitle: '#000000', accentColorPositive: '#000000', accentColorNegative: '#000000', btnColorPrimary: '#87ceeb' },
    'Forest Serenity': { fontFamily: `'Merriweather', serif`, borderRadius: '15px', boxShadow: '0 5px 15px rgba(0, 50, 0, 0.3)', bgImage: 'linear-gradient(120deg, #2d572c, #5a8f59)', textColorTitle: '#e8f5e9', accentColorPositive: '#a5d6a7', accentColorNegative: '#ef9a9a', btnColorPrimary: '#4caf50' },
    '8-Bit Arcade': { fontFamily: `'Press Start 2P', cursive`, borderRadius: '0px', boxShadow: 'none', bgImage: 'linear-gradient(#000000, #000000)', textColorTitle: '#00ff00', accentColorPositive: '#ffff00', accentColorNegative: '#ff0000', btnColorPrimary: '#0000ff' }
};

function applyTheme(themeName) {
    const theme = themes[themeName];
    if (!theme) return;
    data.settings.activeTheme = themeName;
    // Apply all theme properties to the settings object
    Object.keys(theme).forEach(key => {
        data.settings[key] = theme[key];
    });
    saveData();
    initializeSettings(); // Re-init to update UI controls
    applySettings();
}

function saveSettings() {
    data.settings.apiKey = document.getElementById('setting-api-key').value;
    data.settings.bgImage = document.getElementById('setting-bg-image-url').value || data.settings.bgImage;
    data.settings.bgOpacity = parseFloat(document.getElementById('setting-bg-opacity').value);
    data.settings.borderRadius = `${document.getElementById('setting-border-radius').value}px`;
    data.settings.animationSpeed = `${document.getElementById('setting-animation-speed').value}s`;
    data.settings.textColorTitle = document.getElementById('setting-color-title').value;
    data.settings.textColorPrimary = document.getElementById('setting-color-text').value;
    data.settings.accentColorPositive = document.getElementById('setting-color-positive').value;
    data.settings.accentColorNegative = document.getElementById('setting-color-negative').value;
    data.settings.btnColorPrimary = document.getElementById('setting-btn-primary').value;
    data.settings.btnColorSuccess = document.getElementById('setting-btn-success').value;
    data.settings.btnColorDanger = document.getElementById('setting-btn-danger').value;
    data.settings.btnColorWarning = document.getElementById('setting-btn-warning').value;
    data.settings.activeTheme = 'custom';
    
    saveData();
    applySettings();
    alert('Customizations saved!');
}

function applySettings() {
    const root = document.documentElement;
    const bg = data.settings.bgImage.startsWith('data:') || data.settings.bgImage.startsWith('http') ? `url(${data.settings.bgImage})` : data.settings.bgImage || `linear-gradient(135deg, ${data.settings.gradientStart}, ${data.settings.gradientEnd})`;
    root.style.setProperty('--bg-image', bg);
    root.style.setProperty('--bg-opacity', data.settings.bgOpacity);
    root.style.setProperty('--border-radius', data.settings.borderRadius);
    root.style.setProperty('--animation-speed', data.settings.animationSpeed);
    root.style.setProperty('--box-shadow', data.settings.boxShadow);
    root.style.setProperty('--font-family', data.settings.fontFamily);
    root.style.setProperty('--text-title', data.settings.textColorTitle);
    root.style.setProperty('--text-primary', data.settings.textColorPrimary);
    root.style.setProperty('--accent-color-positive', data.settings.accentColorPositive);
    root.style.setProperty('--accent-color-negative', data.settings.accentColorNegative);
    root.style.setProperty('--btn-color-primary-bg', `linear-gradient(135deg, ${data.settings.btnColorPrimary}, ${shadeColor(data.settings.btnColorPrimary, -20)})`);
    root.style.setProperty('--btn-color-success-bg', `linear-gradient(135deg, ${data.settings.btnColorSuccess}, ${shadeColor(data.settings.btnColorSuccess, -20)})`);
    root.style.setProperty('--btn-color-danger-bg', `linear-gradient(135deg, ${data.settings.btnColorDanger}, ${shadeColor(data.settings.btnColorDanger, -20)})`);
    root.style.setProperty('--btn-color-warning-bg', `linear-gradient(135deg, ${data.settings.btnColorWarning}, ${shadeColor(data.settings.btnColorWarning, -20)})`);
}

function initializeSettings() {
    try {
        // Only initialize elements that actually exist
        const themeSelector = document.getElementById('theme-selector');
        if (themeSelector) {
            themeSelector.value = data.settings.activeTheme || 'Liquid Glass';
        }

        // Initialize color inputs if they exist
        const textColorTitle = document.getElementById('text-color-title');
        if (textColorTitle) {
            textColorTitle.value = data.settings.textColorTitle || '#ffffff';
        }

        const textColorPrimary = document.getElementById('text-color-primary');
        if (textColorPrimary) {
            textColorPrimary.value = data.settings.textColorPrimary || '#ffffff';
        }

        const accentColorPositive = document.getElementById('accent-color-positive');
        if (accentColorPositive) {
            accentColorPositive.value = data.settings.accentColorPositive || '#51cf66';
        }

        const accentColorNegative = document.getElementById('accent-color-negative');
        if (accentColorNegative) {
            accentColorNegative.value = data.settings.accentColorNegative || '#ff6b6b';
        }

        // Initialize UI scale if it exists
        const uiScale = document.getElementById('ui-scale');
        if (uiScale) {
            uiScale.value = data.settings.uiScale || 1;
            const uiScaleValue = document.getElementById('ui-scale-value');
            if (uiScaleValue) {
                uiScaleValue.textContent = `${Math.round((data.settings.uiScale || 1) * 100)}%`;
            }
        }

        // Initialize border radius if it exists
        const borderRadius = document.getElementById('border-radius');
        if (borderRadius) {
            borderRadius.value = data.settings.borderRadius || 20;
            const borderRadiusValue = document.getElementById('border-radius-value');
            if (borderRadiusValue) {
                borderRadiusValue.textContent = `${data.settings.borderRadius || 20}px`;
            }
        }

        // Initialize animation speed if it exists
        const animationSpeed = document.getElementById('animation-speed');
        if (animationSpeed) {
            animationSpeed.value = data.settings.animationSpeed || 0.5;
            const animationSpeedValue = document.getElementById('animation-speed-value');
            if (animationSpeedValue) {
                animationSpeedValue.textContent = `${data.settings.animationSpeed || 0.5}s`;
            }
        }

        // Apply current settings
        applySettings();
    } catch (error) {
        console.error('Error in initializeSettings:', error);
    }
}

function handleLocalImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            data.settings.bgImage = e.target.result;
            document.getElementById('setting-bg-image-url').value = '';
            saveData();
            applySettings();
        }
        reader.readAsDataURL(file);
    }
}

function shadeColor(color, percent) {
    let R = parseInt(color.substring(1,3),16);
    let G = parseInt(color.substring(3,5),16);
    let B = parseInt(color.substring(5,7),16);
    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);
    R = (R<255)?R:255; G = (G<255)?G:255; B = (B<255)?B:255;
    const RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
    const GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
    const BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));
    return "#"+RR+GG+BB;
}

// Add missing functions for the settings page
function changeTheme(themeName) {
    data.settings.activeTheme = themeName;
    saveData();
    applySettings();
}

function updateColors() {
    try {
        const textColorTitle = document.getElementById('text-color-title');
        const textColorPrimary = document.getElementById('text-color-primary');
        const accentColorPositive = document.getElementById('accent-color-positive');
        const accentColorNegative = document.getElementById('accent-color-negative');

        if (textColorTitle) data.settings.textColorTitle = textColorTitle.value;
        if (textColorPrimary) data.settings.textColorPrimary = textColorPrimary.value;
        if (accentColorPositive) data.settings.accentColorPositive = accentColorPositive.value;
        if (accentColorNegative) data.settings.accentColorNegative = accentColorNegative.value;

        saveData();
        applySettings();
    } catch (error) {
        console.error('Error updating colors:', error);
    }
}

function updateUIScale(value) {
    try {
        data.settings.uiScale = parseFloat(value);
        const uiScaleValue = document.getElementById('ui-scale-value');
        if (uiScaleValue) {
            uiScaleValue.textContent = `${Math.round(value * 100)}%`;
        }
        saveData();
        applySettings();
    } catch (error) {
        console.error('Error updating UI scale:', error);
    }
}

function updateBorderRadius(value) {
    try {
        data.settings.borderRadius = parseInt(value);
        const borderRadiusValue = document.getElementById('border-radius-value');
        if (borderRadiusValue) {
            borderRadiusValue.textContent = `${value}px`;
        }
        saveData();
        applySettings();
    } catch (error) {
        console.error('Error updating border radius:', error);
    }
}

function updateAnimationSpeed(value) {
    try {
        data.settings.animationSpeed = parseFloat(value);
        const animationSpeedValue = document.getElementById('animation-speed-value');
        if (animationSpeedValue) {
            animationSpeedValue.textContent = `${value}s`;
        }
        saveData();
        applySettings();
    } catch (error) {
        console.error('Error updating animation speed:', error);
    }
}

function exportData() {
    try {
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `finance-tracker-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error exporting data:', error);
        alert('Error exporting data. Please check the console for details.');
    }
}