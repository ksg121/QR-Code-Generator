document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const textInput = document.getElementById('text-input');
    const sizeSelect = document.getElementById('size');
    const foregroundColor = document.getElementById('foreground');
    const backgroundColor = document.getElementById('background');
    const generateBtn = document.getElementById('generate-btn');
    const outputSection = document.getElementById('output-section');
    const qrContainer = document.getElementById('qr-container');
    const downloadBtn = document.getElementById('download-btn');
    const historyContainer = document.getElementById('history-container');
    const toast = document.getElementById('toast');
    
    // Load history from localStorage
    let qrHistory = JSON.parse(localStorage.getItem('qrHistory')) || [];
    
    // Initialize
    updateHistoryUI();
    
    // Event Listeners
    generateBtn.addEventListener('click', generateQRCode);
    downloadBtn.addEventListener('click', downloadQRCode);
    
    // Generate QR Code
    function generateQRCode() {
        const text = textInput.value.trim();
        
        if (!text) {
            showToast('Please enter text or URL first');
            return;
        }
        
        // Clear previous QR code
        qrContainer.innerHTML = '';
        
        // Show loading state
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        generateBtn.disabled = true;
        
        try {
            // Generate QR code
            const size = parseInt(sizeSelect.value);
            
            // Create QR code
            new QRCode(qrContainer, {
                text: text,
                width: size,
                height: size,
                colorDark: foregroundColor.value,
                colorLight: backgroundColor.value,
                correctLevel: QRCode.CorrectLevel.H
            });
            
            // Show output section
            outputSection.style.display = 'flex';
            
            // Save to history
            saveToHistory(text, size, foregroundColor.value, backgroundColor.value);
            
            // Reset button state
            generateBtn.innerHTML = 'Generate QR Code';
            generateBtn.disabled = false;
            
            showToast('QR code generated successfully');
        } catch (error) {
            console.error('Error generating QR code:', error);
            showToast('Error generating QR code');
            
            // Reset button state
            generateBtn.innerHTML = 'Generate QR Code';
            generateBtn.disabled = false;
        }
    }
    
    // Download QR Code
    function downloadQRCode() {
        const qrImage = qrContainer.querySelector('img');
        
        if (!qrImage) {
            showToast('No QR code to download');
            return;
        }
        
        // Create link element
        const link = document.createElement('a');
        link.download = `qrcode-${Date.now()}.png`;
        link.href = qrImage.src;
        link.click();
        
        showToast('QR code downloaded');
    }
    
    // Save to History
    function saveToHistory(text, size, foreground, background) {
        // Create history item
        const historyItem = {
            id: Date.now(),
            text: text,
            size: size,
            foreground: foreground,
            background: background,
            timestamp: new Date().toISOString()
        };
        
        // Add to history array (limit to 10 items)
        qrHistory.unshift(historyItem);
        if (qrHistory.length > 10) {
            qrHistory = qrHistory.slice(0, 10);
        }
        
        // Save to localStorage
        localStorage.setItem('qrHistory', JSON.stringify(qrHistory));
        
        // Update UI
        updateHistoryUI();
    }
    
    // Update History UI
    function updateHistoryUI() {
        // Clear history container
        historyContainer.innerHTML = '';
        
        if (qrHistory.length === 0) {
            historyContainer.innerHTML = '<div class="empty-history">No recent QR codes</div>';
            return;
        }
        
        // Add each history item
        qrHistory.forEach(item => {
            const historyItemEl = document.createElement('div');
            historyItemEl.className = 'history-item';
            
            // Create QR code for history item
            const qrDiv = document.createElement('div');
            new QRCode(qrDiv, {
                text: item.text,
                width: 100,
                height: 100,
                colorDark: item.foreground,
                colorLight: item.background,
                correctLevel: QRCode.CorrectLevel.H
            });
            
            // Add text preview
            const textPreview = document.createElement('p');
            textPreview.textContent = item.text;
            textPreview.title = item.text;
            
            // Add to history item
            historyItemEl.appendChild(qrDiv);
            historyItemEl.appendChild(textPreview);
            
            // Add click event to restore this QR code
            historyItemEl.addEventListener('click', () => {
                restoreFromHistory(item);
            });
            
            historyContainer.appendChild(historyItemEl);
        });
    }
    
    // Restore from History
    function restoreFromHistory(item) {
        textInput.value = item.text;
        sizeSelect.value = item.size;
        foregroundColor.value = item.foreground;
        backgroundColor.value = item.background;
        
        // Generate QR code
        generateQRCode();
        
        showToast('Restored from history');
    }
    
    // Show Toast Message
    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    // Add keyboard shortcut (Enter key)
    textInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            generateQRCode();
        }
    });
});
