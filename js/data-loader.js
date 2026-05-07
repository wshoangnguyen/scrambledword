// js/data-loader.js - CHỈ TỪ FILE JSON, KHÔNG DÙNG GOOGLE SHEETS
const DataLoader = {
    cardsData: [],
    
    async loadData() {
        try {
            // Chỉ tải từ file local, không dùng URL
            const localData = await this.loadFromLocal();
            
            if (localData && localData.length > 0) {
                console.log('✅ Đã tải thành công:', localData.length, 'thẻ');
                this.cardsData = localData;
                return true;
            }
            
            // Không có dữ liệu thì báo lỗi
            console.error('❌ Không thể tải dữ liệu');
            this.cardsData = [];
            return false;
            
        } catch (error) {
            console.error('❌ Lỗi:', error);
            this.cardsData = [];
            return false;
        }
    },
    
    async loadFromLocal() {
        const deckName = CONFIG.CURRENT_DECK;
        const deckConfig = CONFIG.GAME_INFO[deckName];
        
        console.log('📂 Đang mở file:', deckConfig?.file);
        
        // Kiểm tra xem có cấu hình không
        if (!deckConfig || !deckConfig.file) {
            console.error('❌ Không tìm thấy cấu hình cho bộ thẻ:', deckName);
            alert(`Lỗi: Không tìm thấy cấu hình cho bộ thẻ "${deckName}"`);
            return [];
        }
        
        try {
            // Đọc file JSON
            const response = await fetch(deckConfig.file);
            
            // Kiểm tra file có tồn tại không
            if (!response.ok) {
                throw new Error(`Không tìm thấy file: ${deckConfig.file}`);
            }
            
            // Đọc nội dung file JSON
            const deckData = await response.json();
            
            // Kiểm tra dữ liệu có hợp lệ không
            if (!deckData || !Array.isArray(deckData) || deckData.length === 0) {
                throw new Error('File JSON rỗng hoặc sai định dạng');
            }
            
            console.log(`✅ Đọc file thành công: ${deckData.length} thẻ`);
            
            // Chuyển đổi dữ liệu về đúng định dạng
            return deckData.map((item, idx) => ({
                id: item.id || idx + 1,
                name: item.name || item.code || `Thẻ ${idx + 1}`,
                english: item.english || "",
                description: item.description || (item.code ? `Mã: ${item.code}` : 'Kéo vào cột phù hợp'),
                level: 2  // Mặc định level 2 (Bình thường)
            }));
            
        } catch (error) {
            console.error('❌ Lỗi đọc file JSON:', error.message);
            alert(`Lỗi: Không thể đọc file "${deckConfig.file}"\n\n${error.message}\n\nKiểm tra:\n1. File có tồn tại không?\n2. Định dạng JSON có đúng không?`);
            return [];
        }
    },
    
    getCardsData() {
        return this.cardsData;
    },
    
    hasData() {
        return this.cardsData && this.cardsData.length > 0;
    }
};