// Xử lý form và submit
const FormHandler = {
    async submitData() {
        try {
            Utils.showLoading(true, 'loading');
            Utils.disableButton('submitBtn', true);
            
            // Lấy và validate thông tin
            const userName = document.getElementById('userName').value.trim();
            const userEmail = document.getElementById('userEmail').value.trim();
            
            if (!userName) throw new Error('Vui lòng nhập họ tên');
            if (!userEmail) throw new Error('Vui lòng nhập email');
            if (!Utils.isValidEmail(userEmail)) throw new Error('Email không hợp lệ');
            
            // Lấy kết quả đã xếp
            const placedCards = GameState.getPlacedCards();
            if (placedCards.length === 0) {
                throw new Error('Vui lòng xếp ít nhất 1 thẻ vào cột trước khi gửi');
            }
            
            // Tạo kết quả cho từng cột
            const results = {};
            CONFIG.LEVELS.forEach(level => {
                const cardsInLevel = placedCards.filter(c => c.level === level.level);
                results[level.name] = cardsInLevel.map(c => c.name).join(', ');
            });
            
            // Tạo payload
            const payload = {
                timestamp: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
                userName: userName,
                userEmail: userEmail,
                userPhone: document.getElementById('userPhone').value.trim() || 'Không cung cấp',
                userAge: document.getElementById('userAge').value || 'Không cung cấp',
                notes: document.getElementById('notes').value.trim() || 'Không có',
                deck: CONFIG.CURRENT_DECK,
                ...results
            };
            
            console.log('📤 Đang gửi dữ liệu:', payload);
            
            // Gửi dữ liệu
            await fetch(CONFIG.SUBMIT_SHEET_URL, {
                method: 'POST',
                mode: 'no-cors',
                cache: 'no-cache',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            this.showSuccessWithPreview(payload);
            
        } catch (err) {
            console.error('❌ Lỗi:', err);
            Utils.showToast('❌ ' + err.message, 'error');
        } finally {
            Utils.showLoading(false, 'loading');
            Utils.disableButton('submitBtn', false);
        }
    },
    
    showSuccessWithPreview(data) {
        const resultDiv = document.getElementById('resultMessage');
        resultDiv.style.display = 'block';
        resultDiv.style.backgroundColor = '#e8f5e9';
        resultDiv.style.color = '#2e7d32';
        
        const totalPlaced = Object.values(data).filter((v, i) => 
            i >= 6 && v && v !== ''
        ).reduce((sum, val) => sum + (val.split(',').length), 0);
        
        const preview = `
            <div style="margin-bottom: 15px;">
                <strong style="font-size: 16px;">✅ Gửi thành công! Dữ liệu đã được lưu.</strong>
            </div>
            <details open style="margin-top: 10px;">
                <summary style="cursor: pointer; font-weight: bold; color: #667eea; padding: 8px; background: #f0f0f0; border-radius: 8px;">
                    📊 Xem chi tiết kết quả đã gửi
                </summary>
                <div style="background: white; padding: 15px; border-radius: 12px; margin-top: 12px; font-size: 13px; border: 1px solid #e0e0e0; max-height: 500px; overflow-y: auto;">
                    <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 8px; margin-bottom: 12px;">
                        <strong>👤 Họ tên:</strong> <span>${Utils.escapeHtml(data.userName)}</span>
                        <strong>📧 Email:</strong> <span>${Utils.escapeHtml(data.userEmail)}</span>
                        <strong>📱 Điện thoại:</strong> <span>${Utils.escapeHtml(data.userPhone)}</span>
                        <strong>🎂 Độ tuổi:</strong> <span>${Utils.escapeHtml(data.userAge)}</span>
                        <strong>🎴 Bộ thẻ:</strong> <span>${Utils.escapeHtml(data.deck)}</span>
                        <strong>⏰ Thời gian:</strong> <span>${Utils.escapeHtml(data.timestamp)}</span>
                    </div>
                    <hr style="margin: 12px 0;">
                    <div style="margin-bottom: 12px;">
                        ${CONFIG.LEVELS.map(level => `
                            <div style="background: ${level.color}; padding: 8px; border-radius: 8px; margin-bottom: 6px;">
                                <strong>${level.name}:</strong> ${data[level.name] ? '✅ ' + Utils.escapeHtml(data[level.name]) : '❌ Không có'}
                            </div>
                        `).join('')}
                    </div>
                    <hr style="margin: 12px 0;">
                    <div><strong>📝 Ghi chú:</strong><br><em>${Utils.escapeHtml(data.notes)}</em></div>
                    <div style="margin-top: 12px; padding: 8px; background: #f5f5f5; border-radius: 8px;">
                        <strong>📦 Thống kê:</strong> Đã xếp ${totalPlaced} giá trị vào các cột
                    </div>
                </div>
            </details>
            <div style="margin-top: 12px; font-size: 12px; color: #666; text-align: center;">
                💡 Dữ liệu đã được gửi đến chuyên gia. Cảm ơn bạn đã tham gia!
            </div>
        `;
        
        resultDiv.innerHTML = preview;
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    },
    
    resetGame() {
        if (confirm('Bạn có chắc muốn làm lại toàn bộ? Dữ liệu hiện tại sẽ bị mất.')) {
            GameState.reset();
            UIRenderer.syncAllUI();
            
            // Reset form
            document.getElementById('userName').value = '';
            document.getElementById('userEmail').value = '';
            document.getElementById('userPhone').value = '';
            document.getElementById('userAge').value = '';
            document.getElementById('notes').value = '';
            
            // Ẩn kết quả
            const resultDiv = document.getElementById('resultMessage');
            resultDiv.style.display = 'none';
            resultDiv.innerHTML = '';
            
            Utils.showToast('🔄 Đã reset toàn bộ!', 'success', 2000);
        }
    }
};