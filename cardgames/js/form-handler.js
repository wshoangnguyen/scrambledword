// js/form-handler.js - Xử lý form và submit
const FormHandler = {
    // Hàm tính kết quả DISC
    calculateDiscResult(placedCards) {
        // placedCards là các thẻ đã được xếp (không còn trong chồng)
        const scores = { D: 0, I: 0, S: 0, C: 0 };
        let totalCards = 0;
        
        placedCards.forEach(card => {
            // Kiểm tra thẻ có type không (D, I, S, C)
            if (card.type && scores[card.type] !== undefined) {
                // Chuyển level thành điểm: level 0 = 5 điểm, level 4 = 1 điểm
                // level: 0 (Hoàn toàn đúng) -> 5 điểm
                // level: 1 (Thường đúng) -> 4 điểm
                // level: 2 (Phân vân) -> 3 điểm
                // level: 3 (Hiếm khi đúng) -> 2 điểm
                // level: 4 (Hoàn toàn không đúng) -> 1 điểm
                const score = 5 - card.level;
                scores[card.type] += score;
                totalCards++;
            }
        });
        
        // Tìm type có điểm cao nhất
        let dominantType = 'D';
        let maxScore = 0;
        for (const [type, score] of Object.entries(scores)) {
            if (score > maxScore) {
                maxScore = score;
                dominantType = type;
            }
        }
        
        // Tính phần trăm cho mỗi type
        const maxPossibleScore = totalCards * 5;
        const percentages = {
            D: Math.round((scores.D / maxPossibleScore) * 100),
            I: Math.round((scores.I / maxPossibleScore) * 100),
            S: Math.round((scores.S / maxPossibleScore) * 100),
            C: Math.round((scores.C / maxPossibleScore) * 100)
        };
        
        return {
            scores: scores,
            percentages: percentages,
            dominant: dominantType,
            totalCards: totalCards
        };
    },
    
    // Hàm mô tả kết quả DISC
    getDiscDescription(type) {
        const descriptions = {
            D: {
                title: "Phong cách D (Dominance) - Người thống trị",
                shortDesc: "Quyết đoán, thích thử thách, hướng đến kết quả",
                traits: "Mạnh mẽ, tự tin, thích kiểm soát, giải quyết vấn đề nhanh, không ngại rủi ro",
                advise: "Phù hợp với vai trò lãnh đạo, kinh doanh, quản lý dự án. Cần học cách kiên nhẫn và lắng nghe nhiều hơn."
            },
            I: {
                title: "Phong cách I (Influence) - Người ảnh hưởng",
                shortDesc: "Nhiệt tình, thích giao tiếp, truyền cảm hứng",
                traits: "Hòa đồng, lạc quan, sáng tạo, thích được công nhận, dễ tạo mối quan hệ",
                advise: "Phù hợp với truyền thông, marketing, giáo dục, bán hàng. Cần chú ý đến chi tiết và theo dõi tiến độ công việc."
            },
            S: {
                title: "Phong cách S (Steadiness) - Người kiên định",
                shortDesc: "Kiên nhẫn, đáng tin cậy, thích sự ổn định",
                traits: "Điềm tĩnh, trung thành, hợp tác tốt, ghét xung đột, làm việc có hệ thống",
                advise: "Phù hợp với hành chính, chăm sóc khách hàng, hỗ trợ kỹ thuật. Cần mạnh dạn hơn trong việc đưa ra quyết định và thích nghi với thay đổi."
            },
            C: {
                title: "Phong cách C (Conscientiousness) - Người tuân thủ",
                shortDesc: "Chính xác, có nguyên tắc, chú trọng chất lượng",
                traits: "Tỉ mỉ, logic, kỷ luật, thích phân tích, đòi hỏi cao về chất lượng",
                advise: "Phù hợp với kế toán, kiểm toán, kỹ thuật, nghiên cứu. Cần linh hoạt hơn và chấp nhận rủi ro có tính toán."
            }
        };
        return descriptions[type] || {
            title: "Chưa xác định",
            shortDesc: "Hoàn thành bài trắc nghiệm để có kết quả chính xác",
            traits: "",
            advise: "Hãy sắp xếp tất cả các thẻ để nhận được kết quả phân tích chính xác nhất."
        };
    },
    
// js/form-handler.js - Sửa toàn bộ hàm submitData()

// Chuẩn bị dữ liệu đúng format cho Google Sheet

preparePayloadForSheet() {
    const userName = document.getElementById('userName').value.trim();
    const userEmail = document.getElementById('userEmail').value.trim();
    const userPhone = document.getElementById('userPhone').value.trim();
    const userAge = document.getElementById('userAge').value;
    const notes = document.getElementById('notes').value.trim();
    const currentLevels = CONFIG.getCurrentLevels();
    
    // Payload cơ bản
    const payload = {
        timestamp: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
        userName: userName,
        userEmail: userEmail,
        userPhone: userPhone,
        userAge: userAge,
        deck: CONFIG.CURRENT_DECK,
        notes: notes,
        currentLevels: currentLevels  // THÊM DÒNG NÀY để Apps Script biết tên cột
    };
    
    // Lưu tên các cột theo level index
    currentLevels.forEach(level => {
        payload[level.name] = [];  // Khởi tạo mảng rỗng
    });
    
    // ===== XỬ LÝ CHO BỘ SKILLS (MA TRẬN) =====
    if (CONFIG.isMatrixDeck()) {
        const placedCards = GameState.getPlacedCards();
        const matrixCards = placedCards.filter(card => card.row !== undefined && card.col !== undefined);
        
        // Tạo ma trận dữ liệu 3x5
        const matrixData = {};
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 5; col++) {
                matrixData[`row${row}_col${col}`] = [];
            }
        }
        
        matrixCards.forEach(card => {
            const cellKey = `row${card.row}_col${card.col}`;
            if (matrixData[cellKey]) {
                matrixData[cellKey].push(card.name);
            }
        });
        
        payload.matrixData = matrixData;
        return payload;
    }
    
    // ===== XỬ LÝ CHO BỘ THƯỜNG =====
    const placedCards = GameState.getPlacedCards();
    const cardsByLevel = {};
    currentLevels.forEach(level => {
        cardsByLevel[level.name] = [];
    });
    
    placedCards.forEach(card => {
        const levelConfig = currentLevels.find(l => l.level === card.level);
        if (levelConfig) {
            cardsByLevel[levelConfig.name].push(card.name);
        }
    });
    
    currentLevels.forEach(level => {
        payload[level.name] = cardsByLevel[level.name].join(', ');
    });
    
    return payload;
},

// SỬA lại hàm submitData()
async submitData() {
    try {
        Utils.showLoading(true, 'loading');
        Utils.disableButton('submitBtn', true);
        
        // Validate
        const userName = document.getElementById('userName').value.trim();
        const userEmail = document.getElementById('userEmail').value.trim();
        if (!userName) throw new Error('Vui lòng nhập họ tên');
        if (!userEmail) throw new Error('Vui lòng nhập email');
        if (!Utils.isValidEmail(userEmail)) throw new Error('Email không hợp lệ');
        
        // Chuẩn bị payload
        const payload = this.preparePayloadForSheet();
        
        // Kiểm tra đã xếp thẻ chưa
        if (CONFIG.isMatrixDeck() && payload.matrixCardsCount === 0) {
            throw new Error('Vui lòng xếp ít nhất 1 thẻ vào bảng kỹ năng');
        }
        if (!CONFIG.isMatrixDeck() && payload.totalCardsPlaced === 0) {
            throw new Error('Vui lòng xếp ít nhất 1 thẻ vào cột');
        }
        
        console.log('📤 Đang gửi lên Google Sheet:', payload);
        
        // === GỬI DỮ LIỆU THỰC TẾ ===
        const response = await fetch(CONFIG.SUBMIT_SHEET_URL, {
            method: 'POST',
            mode: 'no-cors',  // Quan trọng để tránh lỗi CORS
            cache: 'no-cache',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        // Hiển thị preview thành công
        const currentLevels = CONFIG.getCurrentLevels();
        this.showSuccessWithPreview(payload, currentLevels);
        
        // Tùy chọn: reset form sau khi gửi thành công?
        // document.getElementById('userName').value = '';
        // document.getElementById('userEmail').value = '';
        
    } catch (err) {
        console.error('❌ Lỗi:', err);
        Utils.showToast('❌ ' + err.message, 'error');
    } finally {
        Utils.showLoading(false, 'loading');
        Utils.disableButton('submitBtn', false);
    }
},
    
showSuccessWithPreview(data, currentLevels = null) {
    const resultDiv = document.getElementById('resultMessage');
    resultDiv.style.display = 'block';
    resultDiv.style.backgroundColor = '#e8f5e9';
    resultDiv.style.color = '#2e7d32';
    
    // Nếu không có currentLevels thì lấy từ CONFIG
    if (!currentLevels) {
        currentLevels = CONFIG.getCurrentLevels();
    }
    
    let preview = `
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
    `;
    
    // ========== HIỂN THỊ KẾT QUẢ THEO LOẠI BỘ ==========
    
    if (data.matrixData) {
        // ----- HIỂN THỊ KẾT QUẢ MA TRẬN (BỘ KỸ NĂNG) -----
        const matrixConfig = CONFIG.getMatrixConfig();
        
        preview += `
            <hr style="margin: 12px 0;">
            <div style="background: linear-gradient(135deg, #667eea15, #764ba215); padding: 15px; border-radius: 12px;">
                <h4 style="margin: 0 0 15px 0; color: #f39c12;">⚡ Kết quả bảng Kỹ năng tạo động lực</h4>
                <div style="font-size: 12px; color: #666; margin-bottom: 15px;">
                    📦 Đã xếp ${data.matrixCardsCount} kỹ năng vào bảng
                </div>
        `;
        
        // Tạo bảng HTML hiển thị kết quả
        preview += '<div style="overflow-x: auto;">';
        preview += '<table style="width: 100%; border-collapse: collapse; font-size: 12px;">';
        
        // Header: Các cột Interest
        preview += '<thead><tr>';
        preview += '<th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5;">Mức độ thành thạo ↓</th>';
        matrixConfig.interest.forEach(int => {
            preview += `<th style="border: 1px solid #ddd; padding: 8px; background: ${int.color}; text-align: center;">${Utils.escapeHtml(int.name)}</th>`;
        });
        preview += '</tr></thead>';
        
        // Body: Các hàng Proficiency
        preview += '<tbody>';
        matrixConfig.proficiency.forEach(pro => {
            preview += '<tr>';
            preview += `<td style="border: 1px solid #ddd; padding: 8px; background: ${pro.color}; font-weight: bold;">${Utils.escapeHtml(pro.name)}</td>`;
            
            matrixConfig.interest.forEach(int => {
                const cellKey = `row${pro.row}_col${int.level}`;
                const cards = data.matrixData[cellKey] || [];
                const cardsText = cards.length > 0 ? cards.join('<br>') : '<em style="color: #999;">(trống)</em>';
                preview += `<td style="border: 1px solid #ddd; padding: 8px; vertical-align: top;">${cardsText}</td>`;
            });
            preview += '</tr>';
        });
        preview += '</tbody></table></div>';
        
        // Thêm ghi chú
        preview += `
                <div style="margin-top: 15px; padding: 10px; background: #fff3e0; border-radius: 8px; font-size: 11px;">
                    💡 <strong>Giải thích:</strong> Cột dọc là mức độ YÊU THÍCH, hàng ngang là mức độ THÀNH THẠO.<br>
                    🎯 Ô màu xanh là "điểm vàng" - những kỹ năng bạn vừa giỏi vừa thích làm!
                </div>
            </div>
        `;
        
    } else {
        // ----- HIỂN THỊ KẾT QUẢ CỘT THƯỜNG -----
        preview += '<hr style="margin: 12px 0;"><div style="margin-bottom: 12px;">';
        
        currentLevels.forEach(level => {
            const cards = data[level.name];
            if (cards) {
                preview += `
                    <div style="background: ${level.color}; padding: 10px; border-radius: 8px; margin-bottom: 8px; border-left: 4px solid ${level.borderColor};">
                        <strong style="color: ${level.borderColor};">${level.name}:</strong><br>
                        <span style="font-size: 12px;">${Utils.escapeHtml(cards.substring(0, 200))}${cards.length > 200 ? '...' : ''}</span>
                        <span style="display: inline-block; background: ${level.borderColor}20; padding: 2px 8px; border-radius: 20px; font-size: 11px; margin-top: 5px;">
                            📊 ${cards.split(',').length} thẻ
                        </span>
                    </div>
                `;
            }
        });
        
        preview += '</div>';
        preview += `
            <div style="margin-top: 12px; padding: 8px; background: #f5f5f5; border-radius: 8px;">
                <strong>📦 Thống kê:</strong> Đã xếp ${data.totalCardsPlaced || 0} thẻ vào các cột
            </div>
        `;
    }
    
    preview += `
                <hr style="margin: 12px 0;">
                <div><strong>📝 Ghi chú:</strong><br><em>${Utils.escapeHtml(data.notes || 'Không có ghi chú')}</em></div>
            </div>
        </details>
        <div style="margin-top: 12px; font-size: 12px; color: #666; text-align: center;">
            💡 Dữ liệu đã được ghi nhận. Cảm ơn bạn đã tham gia!
        </div>
    `;
    
    resultDiv.innerHTML = preview;
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
},
    
    resetGame() {
        if (confirm('Bạn có chắc muốn làm lại toàn bộ? Dữ liệu hiện tại sẽ bị mất.')) {
            GameState.reset();
            
            // Reset ma trận nếu cần
            if (CONFIG.isMatrixDeck()) {
                GameState.resetMatrixCards();
            }
            
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