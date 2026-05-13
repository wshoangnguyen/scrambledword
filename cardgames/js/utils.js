// Hàm tiện ích
const Utils = {
    // Escape HTML để tránh XSS
    escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    },
    
    // Hiển thị toast message
    showToast(message, type = 'error', duration = 3000) {
        const errorDiv = document.getElementById('errorMessage');
        if (!errorDiv) return;
        
        errorDiv.textContent = message;
        errorDiv.style.color = type === 'error' ? '#d32f2f' : '#2e7d32';
        
        setTimeout(() => {
            if (errorDiv.textContent === message) {
                errorDiv.textContent = '';
            }
        }, duration);
    },
    
    // Hiển thị loading
    showLoading(show, elementId = 'loading') {
        const loadingDiv = document.getElementById(elementId);
        if (loadingDiv) {
            loadingDiv.style.display = show ? 'block' : 'none';
        }
    },
    
    // Disable button tạm thời
    disableButton(buttonId, disabled, customOpacity = '0.5') {
        const btn = document.getElementById(buttonId);
        if (btn) {
            btn.disabled = disabled;
            btn.style.opacity = disabled ? customOpacity : '1';
        }
    },
    
    // Lấy tham số từ URL
    getUrlParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    },
    
    // Tải bộ thẻ từ file JSON
    async loadDeckFromFile(deckName) {
        try {
            const response = await fetch(`decks/${deckName}.json`);
            if (!response.ok) throw new Error(`Không thể tải bộ thẻ ${deckName}`);
            return await response.json();
        } catch (error) {
            console.error('Lỗi tải deck:', error);
            return null;
        }
    },
    
    // Kiểm tra validate email
    isValidEmail(email) {
        return /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/.test(email);
    }
};