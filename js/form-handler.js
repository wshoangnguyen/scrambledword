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
            
            // Lấy cấu hình cột hiện tại
            const currentLevels = CONFIG.getCurrentLevels();
            
            // Tạo kết quả cho từng cột
            const results = {};
            currentLevels.forEach(level => {
                const cardsInLevel = placedCards.filter(c => c.level === level.level);
                results[level.name] = cardsInLevel.map(c => c.name).join(', ');
            });
            
            // Tạo payload cơ bản
            const payload = {
                timestamp: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
                userName: userName,
                userEmail: userEmail,
                userPhone: document.getElementById('userPhone').value.trim() || 'Không cung cấp',
                userAge: document.getElementById('userAge').value || 'Không cung cấp',
                notes: document.getElementById('notes').value.trim() || 'Không có',
                deck: CONFIG.CURRENT_DECK,
                totalCardsPlaced: placedCards.length,
                ...results
            };
            
            // Nếu là bộ DISC, tính toán thêm kết quả
            if (CONFIG.CURRENT_DECK === 'disc') {
                const discResult = this.calculateDiscResult(placedCards);
                const discDesc = this.getDiscDescription(discResult.dominant);
                
                payload.discAnalysis = {
                    scores: discResult.scores,
                    percentages: discResult.percentages,
                    dominantType: discResult.dominant,
                    dominantTitle: discDesc.title,
                    dominantShortDesc: discDesc.shortDesc,
                    dominantTraits: discDesc.traits,
                    dominantAdvise: discDesc.advise,
                    totalAnalyzedCards: discResult.totalCards
                };
                
                // Thêm phân phối thẻ theo type
                const typeDistribution = { D: 0, I: 0, S: 0, C: 0 };
                placedCards.forEach(card => {
                    if (card.type && typeDistribution[card.type] !== undefined) {
                        typeDistribution[card.type]++;
                    }
                });
                payload.discTypeDistribution = typeDistribution;
            }
            
            console.log('📤 Đang gửi dữ liệu:', payload);
            
            // TODO: Gửi dữ liệu lên server khi có URL
            // await fetch(CONFIG.SUBMIT_SHEET_URL, {
            //     method: 'POST',
            //     mode: 'no-cors',
            //     cache: 'no-cache',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(payload)
            // });
            
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
        
        // Lấy cấu hình cột hiện tại
        const currentLevels = CONFIG.getCurrentLevels();
        
        const totalPlaced = Object.values(data).filter((v, i) => 
            i >= 7 && v && v !== ''
        ).reduce((sum, val) => sum + (typeof val === 'string' ? val.split(',').length : 0), 0);
        
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
                        <strong>📦 Số thẻ đã xếp:</strong> <span>${data.totalCardsPlaced || totalPlaced}</span>
                    </div>
        `;
        
        // Hiển thị kết quả DISC nếu có
        if (data.discAnalysis) {
            const disc = data.discAnalysis;
            preview += `
                <hr style="margin: 12px 0;">
                <div style="background: linear-gradient(135deg, #667eea15, #764ba215); padding: 15px; border-radius: 12px; margin: 10px 0;">
                    <h4 style="margin: 0 0 15px 0; color: #764ba2;">🎯 Kết quả phân tích DISC</h4>
                    
                    <div style="background: white; padding: 12px; border-radius: 10px; margin-bottom: 15px;">
                        <div style="font-size: 18px; font-weight: bold; color: #667eea; margin-bottom: 5px;">
                            ${Utils.escapeHtml(disc.dominantTitle)}
                        </div>
                        <div style="color: #555; margin-bottom: 10px;">
                            ${Utils.escapeHtml(disc.dominantShortDesc)}
                        </div>
                        <div style="background: #f5f5f5; padding: 8px; border-radius: 8px; margin-top: 8px;">
                            <strong>✨ Đặc điểm:</strong> ${Utils.escapeHtml(disc.dominantTraits)}
                        </div>
                        <div style="background: #e3f2fd; padding: 8px; border-radius: 8px; margin-top: 8px;">
                            <strong>💡 Gợi ý:</strong> ${Utils.escapeHtml(disc.dominantAdvise)}
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <strong>📊 Điểm số chi tiết:</strong>
                        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 8px;">
                            ${['D', 'I', 'S', 'C'].map(type => `
                                <div style="text-align: center;">
                                    <div style="font-weight: bold; font-size: 20px; color: ${type === disc.dominantType ? '#764ba2' : '#999'}">
                                        ${disc.scores[type]}
                                    </div>
                                    <div style="font-size: 11px; color: #666;">Type ${type}</div>
                                    <div style="width: 100%; height: 4px; background: #e0e0e0; border-radius: 2px; margin-top: 4px;">
                                        <div style="width: ${disc.percentages[type]}%; height: 100%; background: ${type === disc.dominantType ? '#764ba2' : '#ccc'}; border-radius: 2px;"></div>
                                    </div>
                                    <div style="font-size: 10px; margin-top: 2px;">${disc.percentages[type]}%</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div style="font-size: 12px; color: #666; background: #f9f9f9; padding: 8px; border-radius: 8px;">
                        <strong>📋 Phân phối thẻ theo nhóm:</strong><br>
                        D: ${data.discTypeDistribution.D} thẻ | 
                        I: ${data.discTypeDistribution.I} thẻ | 
                        S: ${data.discTypeDistribution.S} thẻ | 
                        C: ${data.discTypeDistribution.C} thẻ
                        <br><em>(Phân tích dựa trên ${disc.totalAnalyzedCards} thẻ đã sắp xếp)</em>
                    </div>
                </div>
            `;
        } else {
            // Hiển thị kết quả xếp thẻ bình thường
            preview += `
                <hr style="margin: 12px 0;">
                <div style="margin-bottom: 12px;">
                    ${currentLevels.map(level => `
                        <div style="background: ${level.color}; padding: 8px; border-radius: 8px; margin-bottom: 6px;">
                            <strong>${level.name}:</strong> ${data[level.name] ? '✅ ' + Utils.escapeHtml(data[level.name].substring(0, 100)) + (data[level.name].length > 100 ? '...' : '') : '❌ Không có thẻ nào'}
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        preview += `
                    <hr style="margin: 12px 0;">
                    <div><strong>📝 Ghi chú:</strong><br><em>${Utils.escapeHtml(data.notes)}</em></div>
                    <div style="margin-top: 12px; padding: 8px; background: #f5f5f5; border-radius: 8px;">
                        <strong>📦 Thống kê:</strong> Đã xếp ${data.totalCardsPlaced || totalPlaced} giá trị vào các cột
                    </div>
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