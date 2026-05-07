// js/cardManager.js
// Quản lý trạng thái thẻ bài: chồng bài và 5 cột phân loại

class CardManager {
  constructor(cardsData) {
    // Dữ liệu thẻ gốc (từ JSON)
    this.allCards = cardsData;
    
    // Chồng bài (các thẻ chưa được xếp)
    this.deck = [];
    
    // 5 cột phân loại
    this.columns = {
      col1: { name: "Rất quan tâm", cards: [] },      // Cột 1: Rất quan tâm
      col2: { name: "Quan tâm", cards: [] },          // Cột 2: Quan tâm
      col3: { name: "Bình thường", cards: [] },       // Cột 3: Bình thường
      col4: { name: "Không quan tâm", cards: [] },    // Cột 4: Không quan tâm
      col5: { name: "Hoàn toàn không quan tâm", cards: [] }  // Cột 5: Hoàn toàn không quan tâm
    };
    
    // Thẻ đang được chọn (để di chuyển vào cột)
    this.selectedCardId = null;
    
    // Khởi tạo deck và trộn bài
    this.initDeck();
  }
  
  // Khởi tạo deck (sao chép tất cả thẻ và trộn)
  initDeck() {
    // Sao chép toàn bộ thẻ (để không ảnh hưởng đến dữ liệu gốc)
    this.deck = this.allCards.map(card => ({ ...card }));
    // Trộn bài ngẫu nhiên
    this.shuffleDeck();
  }
  
  // Trộn bài (thuật toán Fisher-Yates)
  shuffleDeck() {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }
  
  // Lấy thẻ đầu tiên trong deck (thẻ úp trên cùng)
  getTopCard() {
    if (this.deck.length === 0) return null;
    return this.deck[0];
  }
  
  // Chọn thẻ (khi click vào chồng bài)
  selectTopCard() {
    if (this.deck.length === 0) {
      this.selectedCardId = null;
      return null;
    }
    
    const topCard = this.deck[0];
    this.selectedCardId = topCard.id;
    return topCard;
  }
  
  // Di chuyển thẻ đã chọn vào cột chỉ định
  moveSelectedCardToColumn(columnKey) {
    // Kiểm tra có thẻ đang được chọn không
    if (this.selectedCardId === null) {
      console.warn("Không có thẻ nào được chọn");
      return false;
    }
    
    // Tìm thẻ trong deck
    const cardIndex = this.deck.findIndex(card => card.id === this.selectedCardId);
    if (cardIndex === -1) {
      console.warn("Không tìm thấy thẻ trong deck");
      this.selectedCardId = null;
      return false;
    }
    
    // Lấy thẻ ra khỏi deck
    const [movedCard] = this.deck.splice(cardIndex, 1);
    
    // Thêm thẻ vào cột tương ứng
    if (this.columns[columnKey]) {
      this.columns[columnKey].cards.push(movedCard);
      this.selectedCardId = null;
      return true;
    }
    
    console.warn("Tên cột không hợp lệ");
    return false;
  }
  
  // Lấy thẻ theo ID (để hiển thị chi tiết)
  getCardById(cardId) {
    // Tìm trong deck trước
    let card = this.deck.find(c => c.id === cardId);
    
    // Nếu không tìm thấy trong deck, tìm trong các cột
    if (!card) {
      for (const colKey in this.columns) {
        card = this.columns[colKey].cards.find(c => c.id === cardId);
        if (card) break;
      }
    }
    
    return card;
  }
  
  // Lấy tất cả thẻ đã xếp (trong các cột)
  getAllPlacedCards() {
    const allPlaced = [];
    for (const colKey in this.columns) {
      allPlaced.push(...this.columns[colKey].cards);
    }
    return allPlaced;
  }
  
  // Kiểm tra đã xếp hết thẻ chưa
  isGameComplete() {
    return this.deck.length === 0;
  }
  
  // Lấy số lượng thẻ còn lại trong deck
  getRemainingCardCount() {
    return this.deck.length;
  }
  
  // Lấy thống kê số thẻ trong mỗi cột
  getColumnStatistics() {
    const stats = {};
    for (const colKey in this.columns) {
      stats[colKey] = {
        name: this.columns[colKey].name,
        count: this.columns[colKey].cards.length
      };
    }
    return stats;
  }
  
  // Lấy danh sách thẻ trong một cột (kèm thông tin đầy đủ)
  getColumnCards(columnKey) {
    if (this.columns[columnKey]) {
      return [...this.columns[columnKey].cards];
    }
    return [];
  }
  
  // Phân tích kết quả theo category (ví dụ: RIASEC cho interests)
  analyzeByCategory() {
    const categoryStats = {};
    
    for (const colKey in this.columns) {
      const column = this.columns[colKey];
      categoryStats[colKey] = {
        name: column.name,
        categories: {}
      };
      
      column.cards.forEach(card => {
        if (card.category) {
          if (!categoryStats[colKey].categories[card.category]) {
            categoryStats[colKey].categories[card.category] = 0;
          }
          categoryStats[colKey].categories[card.category]++;
        }
      });
    }
    
    return categoryStats;
  }
  
  // Lấy top N thẻ từ cột "Rất quan tâm" (hoặc cột chỉ định)
  getTopCardsFromColumn(columnKey, limit = 20) {
    if (this.columns[columnKey]) {
      return this.columns[columnKey].cards.slice(0, limit);
    }
    return [];
  }
  
  // Reset toàn bộ game (chơi lại)
  resetGame() {
    // Xóa sạch các cột
    for (const colKey in this.columns) {
      this.columns[colKey].cards = [];
    }
    
    // Reset selected card
    this.selectedCardId = null;
    
    // Khởi tạo lại deck
    this.initDeck();
  }
  
  // Lấy tất cả thẻ từ một cột (dạng object để hiển thị)
  getColumnData() {
    const columnData = {};
    for (const colKey in this.columns) {
      columnData[colKey] = {
        key: colKey,
        name: this.columns[colKey].name,
        cards: [...this.columns[colKey].cards]
      };
    }
    return columnData;
  }
  
  // Helper: Lấy màu sắc cho category (để hiển thị icon)
  getCategoryColor(category) {
    const colorMap = {
      // For interests (RIASEC)
      "Realistic": "#4CAF50",      // Xanh lá
      "Investigative": "#2196F3",  // Xanh dương
      "Artistic": "#FF9800",       // Cam
      "Social": "#9C27B0",         // Tím
      "Enterprising": "#F44336",   // Đỏ
      "Conventional": "#607D8B",   // Xám xanh
      
      // For values
      "Tự do": "#00BCD4",          // Xanh cyan
      "Phát triển": "#FFC107",     // Vàng
      "Quan hệ": "#E91E63",        // Hồng
      "An toàn": "#795548",        // Nâu
      
      // For leisure
      "Tri thức": "#3F51B5",       // Xanh đậm
      "Sáng tạo": "#FF5722",       // Cam đỏ
      "Vận động": "#8BC34A",       // Xanh nhạt
      "Sức khỏe": "#009688",       // Xanh ngọc
      "Ngoài trời": "#4CAF50",     // Xanh lá
      "Xã hội": "#E91E63",         // Hồng
      "Giải trí": "#FF9800",       // Cam
      "Kinh tế": "#F44336",        // Đỏ
      "Gia đình": "#9C27B0",       // Tím
      
      // For motivation
      "Lập kế hoạch": "#2196F3",
      "Tổ chức": "#00BCD4",
      "Kỷ luật": "#4CAF50",
      "Nội tại": "#FF9800",
      "Tâm lý": "#9C27B0",
      "Học hỏi": "#3F51B5",
      "Tự chăm sóc": "#E91E63",
      "Xã hội": "#F44336",
      "Giao tiếp": "#FF5722",
      "Tư duy": "#607D8B",
      "Linh hoạt": "#009688",
      "Chủ động": "#8BC34A",
      "Tập trung": "#795548",
      "Hình dung": "#FFC107"
    };
    
    return colorMap[category] || "#CCCCCC"; // Mặc định xám
  }
}

// Export để sử dụng (nếu dùng module, nhưng với Vanilla JS thì dùng global)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CardManager;
}