// js/resultRenderer.js
// Hiển thị kết quả sau khi xếp xong thẻ với nhiều dạng biểu đồ và phân tích

class ResultRenderer {
  constructor(cardManager, setData, setType) {
    this.cardManager = cardManager;
    this.setData = setData;
    this.setType = setType; // 'interest', 'values', 'leisure', 'motivation'
    this.modal = null;
  }
  
  // Hiển thị kết quả chính
  showResult() {
    // Lấy dữ liệu từ cardManager
    const columnStats = this.cardManager.getColumnStatistics();
    const categoryAnalysis = this.cardManager.analyzeByCategory();
    const topCards = this.cardManager.getTopCardsFromColumn('col1', 20);
    const allPlacedCards = this.cardManager.getAllPlacedCards();
    
    // Tạo modal kết quả
    this.createResultModal(columnStats, categoryAnalysis, topCards, allPlacedCards);
  }
  
  // Tạo modal kết quả
  createResultModal(columnStats, categoryAnalysis, topCards, allPlacedCards) {
    // Xóa modal cũ nếu có
    if (this.modal) {
      this.modal.remove();
    }
    
    this.modal = document.createElement('div');
    this.modal.className = 'result-modal';
    
    this.modal.innerHTML = `
      <div class="result-modal-content">
        <div class="result-modal-header">
          <h2>📊 Kết quả phân tích - ${this.setData.title || ''}</h2>
          <button class="close-modal">&times;</button>
        </div>
        
        <div class="result-modal-body">
          ${this.renderStatistics(columnStats)}
          ${this.renderTopCards(topCards)}
          ${this.renderCategoryAnalysis(categoryAnalysis)}
          ${this.renderRecommendations(columnStats, categoryAnalysis, topCards)}
          ${this.renderComparison(allPlacedCards)}
        </div>
        
        <div class="result-modal-footer">
          <button class="btn btn-primary" id="export-pdf">📄 Xuất PDF</button>
          <button class="btn btn-secondary" id="export-text">📝 Xuất văn bản</button>
          <button class="btn btn-secondary" id="copy-result">📋 Sao chép</button>
          <button class="btn btn-primary" id="play-again">🎮 Chơi lại</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(this.modal);
    this.attachModalEvents();
  }
  
  // Render thống kê số lượng
  renderStatistics(columnStats) {
    const columns = [
      { key: 'col1', label: 'Rất quan tâm', color: '#4CAF50', icon: '🔥' },
      { key: 'col2', label: 'Quan tâm', color: '#8BC34A', icon: '👍' },
      { key: 'col3', label: 'Bình thường', color: '#FFC107', icon: '😐' },
      { key: 'col4', label: 'Không quan tâm', color: '#FF9800', icon: '👎' },
      { key: 'col5', label: 'Hoàn toàn không quan tâm', color: '#F44336', icon: '❌' }
    ];
    
    const totalCards = Object.values(columnStats).reduce((sum, stat) => sum + stat.count, 0);
    
    return `
      <div class="result-section statistics-section">
        <h3>📈 Thống kê tổng quan</h3>
        <div class="stats-grid">
          ${columns.map(col => {
            const stat = columnStats[col.key];
            const percent = totalCards > 0 ? ((stat?.count || 0) / totalCards * 100).toFixed(1) : 0;
            return `
              <div class="stat-card">
                <div class="stat-icon">${col.icon}</div>
                <div class="stat-info">
                  <div class="stat-label">${col.label}</div>
                  <div class="stat-number">${stat?.count || 0}</div>
                  <div class="stat-percent">${percent}%</div>
                </div>
                <div class="stat-bar" style="width: ${percent}%; background-color: ${col.color}"></div>
              </div>
            `;
          }).join('')}
        </div>
        <div class="total-cards">Tổng số thẻ đã xếp: ${totalCards}</div>
      </div>
    `;
  }
  
  // Render top thẻ ở cột quan tâm nhất
  renderTopCards(topCards) {
    if (topCards.length === 0) {
      return `
        <div class="result-section">
          <h3>⭐ Thẻ bạn rất quan tâm</h3>
          <div class="empty-message">
            <p>😔 Bạn chưa chọn thẻ nào ở mức "Rất quan tâm"</p>
            <p>Hãy thử xem lại bộ thẻ và chọn ra những thẻ thực sự thu hút bạn!</p>
          </div>
        </div>
      `;
    }
    
    return `
      <div class="result-section top-cards-section">
        <h3>⭐ Top ${topCards.length} thẻ bạn ${this.getColumnLabel('col1')}</h3>
        <div class="top-cards-list">
          ${topCards.map((card, index) => `
            <div class="top-card-item" data-card-id="${card.id}">
              <div class="top-card-rank">${index + 1}</div>
              <div class="top-card-info">
                <div class="top-card-name">${this.escapeHtml(card.name)}</div>
                <div class="top-card-category">
                  <span class="category-badge" style="background-color: ${this.cardManager.getCategoryColor(card.category)}">
                    ${card.category || 'Chưa phân loại'}
                  </span>
                </div>
              </div>
              <div class="top-card-action">
                <button class="btn-detail" data-card-id="${card.id}">📖 Chi tiết</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
  
  // Render phân tích theo category
  renderCategoryAnalysis(categoryAnalysis) {
    // Lọc chỉ hiển thị các cột có thẻ
    const nonEmptyColumns = Object.entries(categoryAnalysis).filter(([_, data]) => 
      Object.keys(data.categories).length > 0
    );
    
    if (nonEmptyColumns.length === 0) {
      return '';
    }
    
    return `
      <div class="result-section category-analysis">
        <h3>🏷️ Phân tích theo chủ đề</h3>
        <div class="category-tabs">
          ${nonEmptyColumns.map(([colKey, data], idx) => `
            <button class="tab-btn ${idx === 0 ? 'active' : ''}" data-tab="${colKey}">
              ${this.getColumnLabel(colKey)}
            </button>
          `).join('')}
        </div>
        ${nonEmptyColumns.map(([colKey, data]) => `
          <div class="tab-content" id="tab-${colKey}" style="display: ${nonEmptyColumns[0][0] === colKey ? 'block' : 'none'}">
            <div class="category-chart">
              ${this.renderCategoryChart(data.categories)}
            </div>
            <div class="category-tags">
              ${Object.entries(data.categories).map(([cat, count]) => `
                <span class="category-tag" style="border-left-color: ${this.cardManager.getCategoryColor(cat)}">
                  <strong>${cat}</strong>: ${count} thẻ
                </span>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  // Render biểu đồ category (dạng thanh ngang đơn giản)
  renderCategoryChart(categories) {
    const total = Object.values(categories).reduce((a, b) => a + b, 0);
    if (total === 0) return '<p>Không có dữ liệu</p>';
    
    return `
      <div class="chart-container">
        ${Object.entries(categories).map(([cat, count]) => {
          const percent = (count / total * 100).toFixed(1);
          return `
            <div class="chart-item">
              <div class="chart-label">
                <span class="chart-category">${cat}</span>
                <span class="chart-value">${count} (${percent}%)</span>
              </div>
              <div class="chart-bar-container">
                <div class="chart-bar" style="width: ${percent}%; background-color: ${this.cardManager.getCategoryColor(cat)}">
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }
  
  // Render gợi ý dựa trên kết quả
  renderRecommendations(columnStats, categoryAnalysis, topCards) {
    const recommendations = [];
    const topCount = columnStats.col1?.count || 0;
    const interestedCount = (columnStats.col1?.count || 0) + (columnStats.col2?.count || 0);
    const totalCards = Object.values(columnStats).reduce((sum, stat) => sum + stat.count, 0);
    
    // Gợi ý dựa trên số lượng thẻ ở cột "Rất quan tâm"
    if (topCount === 0) {
      recommendations.push({
        type: 'warning',
        message: 'Bạn chưa chọn bất kỳ thẻ nào ở mức "Rất quan tâm". Hãy thử xem lại và chọn ra những thẻ thực sự thu hút bạn!'
      });
    } else if (topCount < 5) {
      recommendations.push({
        type: 'info',
        message: `Bạn chỉ có ${topCount} thẻ ở mức "Rất quan tâm". Điều này cho thấy bạn khá kỹ tính trong việc lựa chọn. Hãy tập trung vào những thẻ này để tìm ra hướng đi phù hợp nhất.`
      });
    } else if (topCount > 25) {
      recommendations.push({
        type: 'info',
        message: `Bạn có tới ${topCount} thẻ "Rất quan tâm"! Hãy thử chọn lọc lại, giữ lại khoảng 15-20 thẻ quan trọng nhất để có cái nhìn rõ ràng hơn về ưu tiên của mình.`
      });
    } else {
      recommendations.push({
        type: 'success',
        message: `Tuyệt vời! Bạn đã chọn được ${topCount} thẻ "Rất quan tâm". Đây là những lựa chọn tiềm năng nhất dành cho bạn.`
      });
    }
    
    // Gợi ý dựa trên tỷ lệ quan tâm
    const interestRate = (interestedCount / totalCards * 100).toFixed(1);
    if (parseFloat(interestRate) > 60) {
      recommendations.push({
        type: 'success',
        message: `Bạn quan tâm đến ${interestRate}% số thẻ trong bộ. Điều này cho thấy bạn có nhiều hứng thú và cởi mở với nhiều lĩnh vực khác nhau!`
      });
    } else if (parseFloat(interestRate) < 30) {
      recommendations.push({
        type: 'info',
        message: `Bạn chỉ quan tâm đến ${interestRate}% số thẻ. Có thể bạn đang ở giai đoạn thu hẹp lựa chọn hoặc chưa tìm thấy lĩnh vực thực sự phù hợp.`
      });
    }
    
    // Gợi ý dựa trên category nổi bật
    const col1Categories = categoryAnalysis.col1?.categories || {};
    const topCategory = Object.entries(col1Categories).sort((a, b) => b[1] - a[1])[0];
    if (topCategory && topCount > 0) {
      recommendations.push({
        type: 'highlight',
        message: `Chủ đề thu hút bạn nhiều nhất là: <strong>"${topCategory[0]}"</strong> với ${topCategory[1]} thẻ. Đây có thể là định hướng phù hợp cho bạn!`
      });
    }
    
    // Gợi ý đặc biệt theo từng bộ thẻ
    if (this.setType === 'interest' && topCards.length > 0) {
      const top3 = topCards.slice(0, 3).map(c => c.name).join(', ');
      recommendations.push({
        type: 'suggestion',
        message: `💼 Gợi ý nghề nghiệp: Dựa trên sở thích của bạn, hãy tìm hiểu thêm về các nghề: ${top3}. Đây có thể là những hướng đi tiềm năng!`
      });
    }
    
    if (this.setType === 'values' && topCards.length > 0) {
      recommendations.push({
        type: 'suggestion',
        message: `💎 Giá trị cốt lõi: Những giá trị bạn coi trọng nhất sẽ giúp bạn tìm được môi trường làm việc phù hợp. Hãy ưu tiên các công ty có văn hóa đề cao những giá trị này.`
      });
    }
    
    if (this.setType === 'leisure' && topCards.length > 0) {
      recommendations.push({
        type: 'suggestion',
        message: `🎨 Kế hoạch nghỉ hưu: Hãy bắt đầu dành thời gian cho các hoạt động ${topCards[0]?.name || 'yêu thích'} ngay hôm nay, đừng chờ đến khi nghỉ hưu!`
      });
    }
    
    if (this.setType === 'motivation' && topCards.length > 0) {
      recommendations.push({
        type: 'suggestion',
        message: `⚡ Phát triển bản thân: Tập trung phát triển ${topCards[0]?.name || 'các kỹ năng'} - đây là điểm mạnh bạn có thể khai thác để tạo động lực.`
      });
    }
    
    return `
      <div class="result-section recommendations">
        <h3>💡 Phân tích & Gợi ý</h3>
        <div class="recommendations-list">
          ${recommendations.map(rec => `
            <div class="recommendation-item ${rec.type}">
              <span class="rec-icon">${rec.type === 'success' ? '✓' : rec.type === 'warning' ? '⚠️' : rec.type === 'highlight' ? '⭐' : '💡'}</span>
              <p>${rec.message}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
  
  // Render so sánh giữa các cột
  renderComparison(allPlacedCards) {
    if (allPlacedCards.length === 0) return '';
    
    return `
      <div class="result-section comparison">
        <h3>📊 Biểu đồ phân bố</h3>
        <canvas id="distribution-chart" width="400" height="200"></canvas>
      </div>
    `;
  }
  
  // Gắn sự kiến cho modal
  attachModalEvents() {
    // Nút đóng modal
    const closeBtn = this.modal.querySelector('.close-modal');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeModal());
    }
    
    // Click ra ngoài để đóng
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.closeModal();
      }
    });
    
    // Tab chuyển đổi
    const tabBtns = this.modal.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tabId = btn.dataset.tab;
        // Xóa active class khỏi tất cả tab
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Ẩn tất cả tab content
        const tabContents = this.modal.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
          content.style.display = 'none';
        });
        
        // Hiển thị tab được chọn
        const selectedContent = this.modal.querySelector(`#tab-${tabId}`);
        if (selectedContent) {
          selectedContent.style.display = 'block';
        }
      });
    });
    
    // Nút xuất PDF
    const exportPdfBtn = this.modal.querySelector('#export-pdf');
    if (exportPdfBtn) {
      exportPdfBtn.addEventListener('click', () => this.exportAsPDF());
    }
    
    // Nút xuất văn bản
    const exportTextBtn = this.modal.querySelector('#export-text');
    if (exportTextBtn) {
      exportTextBtn.addEventListener('click', () => this.exportAsText());
    }
    
    // Nút sao chép
    const copyBtn = this.modal.querySelector('#copy-result');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => this.copyToClipboard());
    }
    
    // Nút chơi lại
    const playAgainBtn = this.modal.querySelector('#play-again');
    if (playAgainBtn) {
      playAgainBtn.addEventListener('click', () => {
        this.closeModal();
        if (typeof resetGame === 'function') {
          resetGame();
        } else {
          window.location.reload();
        }
      });
    }
    
    // Sự kiện chi tiết thẻ
    const detailBtns = this.modal.querySelectorAll('.btn-detail');
    detailBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const cardId = parseInt(btn.dataset.cardId);
        const card = this.cardManager.getCardById(cardId);
        if (card) {
          this.showCardDetail(card);
        }
      });
    });
    
    // Vẽ biểu đồ
    this.drawChart();
  }
  
  // Vẽ biểu đồ phân bố
  drawChart() {
    const canvas = this.modal.querySelector('#distribution-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const columnStats = this.cardManager.getColumnStatistics();
    
    const labels = ['Rất quan tâm', 'Quan tâm', 'Bình thường', 'Không quan tâm', 'Hoàn toàn không'];
    const data = [
      columnStats.col1?.count || 0,
      columnStats.col2?.count || 0,
      columnStats.col3?.count || 0,
      columnStats.col4?.count || 0,
      columnStats.col5?.count || 0
    ];
    const colors = ['#4CAF50', '#8BC34A', '#FFC107', '#FF9800', '#F44336'];
    
    // Vẽ biểu đồ đơn giản
    canvas.width = 400;
    canvas.height = 200;
    
    const maxData = Math.max(...data, 1);
    const barWidth = 50;
    const startX = 50;
    const startY = 180;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < data.length; i++) {
      const height = (data[i] / maxData) * 120;
      const x = startX + i * (barWidth + 15);
      const y = startY - height;
      
      // Vẽ cột
      ctx.fillStyle = colors[i];
      ctx.fillRect(x, y, barWidth - 5, height);
      
      // Vẽ số lượng trên cột
      ctx.fillStyle = '#333';
      ctx.font = '12px Arial';
      ctx.fillText(data[i], x + 15, y - 5);
      
      // Vẽ nhãn
      ctx.fillStyle = '#666';
      ctx.font = '10px Arial';
      ctx.fillText(labels[i], x + 5, startY + 15);
    }
  }
  
  // Hiển thị chi tiết thẻ
  showCardDetail(card) {
    const detailModal = document.createElement('div');
    detailModal.className = 'card-detail-modal';
    detailModal.innerHTML = `
      <div class="card-detail-content">
        <button class="close-detail">&times;</button>
        <h3>${this.escapeHtml(card.name)}</h3>
        <div class="detail-info">
          <p><strong>ID:</strong> ${card.id}</p>
          <p><strong>Chủ đề:</strong> 
            <span style="background-color: ${this.cardManager.getCategoryColor(card.category)}; padding: 4px 8px; border-radius: 4px;">
              ${card.category || 'Chưa phân loại'}
            </span>
          </p>
          <p><strong>Mô tả:</strong> ${card.description || 'Chưa có mô tả chi tiết'}</p>
        </div>
        <button class="btn-close">Đóng</button>
      </div>
    `;
    
    document.body.appendChild(detailModal);
    
    const closeDetail = () => detailModal.remove();
    detailModal.querySelector('.close-detail')?.addEventListener('click', closeDetail);
    detailModal.querySelector('.btn-close')?.addEventListener('click', closeDetail);
    detailModal.addEventListener('click', (e) => {
      if (e.target === detailModal) closeDetail();
    });
  }
  
  // Xuất kết quả dạng văn bản
  exportAsText() {
    const content = this.generateTextReport();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `ket_qua_${this.setType}_${new Date().toISOString().slice(0, 19)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    this.showNotification('Đã xuất file văn bản!', 'success');
  }
  
  // Sao chép kết quả vào clipboard
  async copyToClipboard() {
    const content = this.generateTextReport();
    try {
      await navigator.clipboard.writeText(content);
      this.showNotification('Đã sao chép kết quả vào clipboard!', 'success');
    } catch (err) {
      this.showNotification('Không thể sao chép. Vui lòng thử lại!', 'error');
    }
  }
  
  // Tạo báo cáo dạng văn bản
  generateTextReport() {
    const columnStats = this.cardManager.getColumnStatistics();
    const topCards = this.cardManager.getTopCardsFromColumn('col1', 20);
    const categoryAnalysis = this.cardManager.analyzeByCategory();
    
    let report = `KẾT QUẢ TRẮC NGHIỆM\n`;
    report += `==================\n\n`;
    report += `Bộ thẻ: ${this.setData.title || this.setType}\n`;
    report += `Ngày: ${new Date().toLocaleString('vi-VN')}\n\n`;
    
    report += `THỐNG KÊ SỐ LƯỢNG:\n`;
    report += `- Rất quan tâm: ${columnStats.col1?.count || 0}\n`;
    report += `- Quan tâm: ${columnStats.col2?.count || 0}\n`;
    report += `- Bình thường: ${columnStats.col3?.count || 0}\n`;
    report += `- Không quan tâm: ${columnStats.col4?.count || 0}\n`;
    report += `- Hoàn toàn không: ${columnStats.col5?.count || 0}\n\n`;
    
    report += `TOP THẺ RẤT QUAN TÂM:\n`;
    topCards.forEach((card, i) => {
      report += `${i+1}. ${card.name} (${card.category || ''})\n`;
    });
    report += `\n`;
    
    report += `PHÂN TÍCH THEO CHỦ ĐỀ:\n`;
    Object.entries(categoryAnalysis).forEach(([colKey, data]) => {
      if (Object.keys(data.categories).length > 0) {
        report += `\n${this.getColumnLabel(colKey)}:\n`;
        Object.entries(data.categories).forEach(([cat, count]) => {
          report += `  - ${cat}: ${count} thẻ\n`;
        });
      }
    });
    
    return report;
  }
  
  // Xuất PDF (sử dụng window.print)
  exportAsPDF() {
    const printContent = this.modal.querySelector('.result-modal-body').cloneNode(true);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Kết quả trắc nghiệm - ${this.setData.title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h3 { color: #333; margin-top: 20px; }
            .stat-card { margin: 10px 0; }
            .top-card-item { margin: 5px 0; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Kết quả trắc nghiệm - ${this.setData.title}</h1>
          ${printContent.innerHTML}
          <p style="margin-top: 30px;">Ngày xuất: ${new Date().toLocaleString('vi-VN')}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }
  
  // Helper: Lấy nhãn cột
  getColumnLabel(colKey) {
    const labels = {
      col1: 'Rất quan tâm',
      col2: 'Quan tâm',
      col3: 'Bình thường',
      col4: 'Không quan tâm',
      col5: 'Hoàn toàn không quan tâm'
    };
    return labels[colKey] || colKey;
  }
  
  // Helper: Escape HTML
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  // Helper: Hiển thị thông báo
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#F44336' : '#2196F3'};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  }
  
  // Đóng modal
  closeModal() {
    if (this.modal) {
      this.modal.remove();
      this.modal = null;
    }
  }
}

// Export để sử dụng
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ResultRenderer;
}