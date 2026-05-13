// js/config.js - Cấu hình game
const CONFIG = {
    // Cấu hình cột mặc định (vẫn giữ để dùng cho các bộ khác)
    DEFAULT_LEVELS: [
        { name: "Không quan tâm", level: 0, color: "#ffebee", borderColor: "#ff6b6b" },
        { name: "Quan tâm một chút", level: 1, color: "#fff3e0", borderColor: "#ffa500" },
        { name: "Bình thường", level: 2, color: "#e8f5e9", borderColor: "#4caf50" },
        { name: "Quan tâm", level: 3, color: "#e3f2fd", borderColor: "#2196f3" },
        { name: "Luôn luôn quan tâm", level: 4, color: "#f3e5f5", borderColor: "#9c27b0" }
    ],
    
    // Cấu hình cột cho từng bộ thẻ
    DECK_LEVELS: {
        // Bộ Sở thích nghề nghiệp
        careers: [
            { name: "Rất quan tâm", level: 0, color: "#f3e5f5", borderColor: "#9c27b0" },
            { name: "Quan tâm", level: 1, color: "#e3f2fd", borderColor: "#2196f3" },
            { name: "Bình thường", level: 2, color: "#e8f5e9", borderColor: "#4caf50" },
            { name: "Không quan tâm", level: 3, color: "#fff3e0", borderColor: "#ffa500" },
            { name: "Hoàn toàn không quan tâm", level: 4, color: "#ffebee", borderColor: "#ff6b6b" }
        ],
        
        // Bộ Giá trị nghề nghiệp
        career: [
            { name: "Luôn luôn coi trọng", level: 0, color: "#f3e5f5", borderColor: "#9c27b0" },
            { name: "Thường coi trọng", level: 1, color: "#e3f2fd", borderColor: "#2196f3" },
            { name: "Thỉnh thoảng coi trọng", level: 2, color: "#e8f5e9", borderColor: "#4caf50" },
            { name: "Ít khi coi trọng", level: 3, color: "#fff3e0", borderColor: "#ffa500" },
            { name: "Không bao giờ coi trọng", level: 4, color: "#ffebee", borderColor: "#ff6b6b" }
        ],
        
        // Bộ Hoạt động giải trí
        entertainment: [
            { name: "Hàng ngày", level: 0, color: "#f3e5f5", borderColor: "#9c27b0" },
            { name: "Thường xuyên", level: 1, color: "#e3f2fd", borderColor: "#2196f3" },
            { name: "Thỉnh thoảng", level: 2, color: "#e8f5e9", borderColor: "#4caf50" },
            { name: "Ít khi", level: 3, color: "#fff3e0", borderColor: "#ffa500" },
            { name: "Không bao giờ", level: 4, color: "#ffebee", borderColor: "#ff6b6b" }
        ],
        
        // Bộ Kỹ năng tạo động lực (đặc biệt - sẽ xử lý riêng)
        skills: {
            type: "matrix", // Đánh dấu đây là dạng ma trận
            interest: [  // Cột ngang - mức độ quan tâm
                { name: "Cực kỳ thích sử dụng", level: 0, color: "#f3e5f5", borderColor: "#9c27b0" },
                { name: "Thường sử dụng", level: 1, color: "#e3f2fd", borderColor: "#2196f3" },
                { name: "Thỉnh thoảng sử dụng", level: 2, color: "#e8f5e9", borderColor: "#4caf50" },
                { name: "Ít sử dụng", level: 3, color: "#fff3e0", borderColor: "#ffa500" },
                { name: "Hoàn toàn không thích sử dụng", level: 4, color: "#ffebee", borderColor: "#ff6b6b" }
            ],
            proficiency: [  // Hàng dọc - mức độ thành thạo
                { name: "Rất thành thạo", row: 0, color: "#e8eaf6", borderColor: "#3f51b5" },
                { name: "Thành thạo", row: 1, color: "#fff3e0", borderColor: "#ff9800" },
                { name: "Chưa đủ mức độ cần thiết", row: 2, color: "#ffebee", borderColor: "#f44336" }
            ]
        },

        disc: [
            { name: "Hoàn toàn đúng với tôi", level: 0, color: "#f3e5f5", borderColor: "#9c27b0" },
            { name: "Thường đúng", level: 1, color: "#e3f2fd", borderColor: "#2196f3" },
            { name: "Phân vân / Bình thường", level: 2, color: "#e8f5e9", borderColor: "#4caf50" },
            { name: "Hiếm khi đúng", level: 3, color: "#fff3e0", borderColor: "#ffa500" },
            { name: "Hoàn toàn không đúng", level: 4, color: "#ffebee", borderColor: "#ff6b6b" }
        ]
    },
    
    // Hàm lấy cấu hình cột hiện tại
getCurrentLevels() {
    const deckName = this.CURRENT_DECK;
    const deckConfig = this.DECK_LEVELS[deckName];
    
    // Nếu là bộ skills (dạng ma trận)
    if (deckName === 'skills' && deckConfig && deckConfig.type === 'matrix') {
        return deckConfig.interest; // Trả về cột ngang
    }
    
    // Nếu có cấu hình riêng thì dùng, không thì dùng mặc định
    return deckConfig || this.DEFAULT_LEVELS;
},
    
    // Kiểm tra xem bộ hiện tại có phải dạng ma trận không
isMatrixDeck() {
    const deckName = this.CURRENT_DECK;
    const deckConfig = this.DECK_LEVELS[deckName];
    // Thêm kiểm tra deckConfig tồn tại
    return deckName === 'skills' && deckConfig && deckConfig.type === 'matrix';
},
    
    // Lấy cấu hình ma trận đầy đủ cho bộ skills
    getMatrixConfig() {
        return this.DECK_LEVELS.skills;
    },
    
    // Cấu hình giới hạn thẻ cho từng cột đặc biệt
    // Chỉ áp dụng cho bộ hiện tại
    getColumnLimit(levelName, levelIndex) {
        const deckName = this.CURRENT_DECK;
        
        // Giới hạn theo từng bộ thẻ
        const limits = {
            // Bộ Giá trị nghề nghiệp
            career: {
                maxCards: 10,
                columnNames: ['Luôn luôn coi trọng'],
                columnIndexes: [0]  // Cột đầu tiên (level 0)
            },
            // Bộ Sở thích nghề nghiệp
            careers: {
                maxCards: 20,
                columnNames: ['Rất quan tâm'],
                columnIndexes: [0]  // Cột đầu tiên (level 0)
            },
            // Bộ Hoạt động giải trí
            entertainment: {
                maxCards: 10,
                columnNames: ['Hàng ngày'],
                columnIndexes: [0]  // Cột đầu tiên (level 0)
            },
            // Bộ Kỹ năng - không giới hạn
            skills: {
                maxCards: null,
                columnNames: [],
                columnIndexes: []
            }
        };
        
        const deckLimit = limits[deckName];
        if (!deckLimit || deckLimit.maxCards === null) return null;
        
        // Kiểm tra nếu cột hiện tại nằm trong danh sách cần giới hạn
        if (deckLimit.columnIndexes.includes(levelIndex)) {
            return deckLimit.maxCards;
        }
        
        return null;
    },
    
    // Hàm kiểm tra giới hạn (giữ nguyên hoặc cập nhật)
    MAX_CARDS_SPECIAL_COLUMN: 10,  // Giá trị mặc định (sẽ được ghi đè bởi getColumnLimit)
    SPECIAL_COLUMNS: [0, 4],  // Giữ nguyên nhưng sẽ kiểm tra linh hoạt hơn
    
    // Hàm kiểm tra có giới hạn không
    hasColumnLimit(levelIndex) {
        const limit = this.getColumnLimit(null, levelIndex);
        return limit !== null;
    },
 
    // Thông tin các bộ thẻ
    GAME_INFO: {
        career: {
            file: 'decks/careerValues.json',
            title: " Giá trị nghề nghiệp",
            subtitle: "Giúp người đang tìm việc, hoặc muốn thay đổi công việc, tìm được môi trường phù hợp với niềm tin và mong muốn cá nhân.",
            instructions: "Đọc 54 thẻ giá trị và đặt vào các cột tương ứng."
        },
        entertainment: {
            file: 'decks/entertainment.json',
            title: " Hoạt động giải trí",
            subtitle: "Công cụ này giúp bạn xác định mức độ hài lòng với các hoạt động giải trí, tìm ra sự tương đồng hoặc khác biệt giữa bạn và người thân/đối tác, từ đó áp dụng vào các quyết định nghỉ hưu trong tương lai.",
            instructions: "Giả sử: Bạn được thông báo là mình không cần đi làm nữa nhưng vẫn được nhận lương đầy đủ trong 30 năm tới.<br/>Bạn sẽ làm gì để lấp đầy khoảng thời gian 8 tiếng làm việc mỗi ngày như trước kia?<br/>Bạn nên thực hiện xếp thẻ một mình trước khi chia sẻ và thảo luận với người thân."
        },
        skills: {
            file: 'decks/motivatingSkills.json',
            title: " Kỹ năng tạo động lực",
            subtitle: "Vừa làm cực giỏi, vừa thấy cực vui! Khi làm những việc đó, con sẽ giống như một siêu anh hùng đang sử dụng siêu năng lực của mình vậy.",
            instructions: "Có những việc con làm rất giỏi nhưng lại thấy chán (như việc dọn đồ chơi).<br/>Có những việc con rất thích làm nhưng lại chưa giỏi lắm (như việc tập bơi).<br/>Mục tiêu của chúng ta là tìm ra những việc nằm ở 'điểm vàng': Vừa làm cực giỏi, vừa thấy cực vui!<br/> Khi làm những việc đó, con sẽ giống như một siêu anh hùng đang sử dụng siêu năng lực của mình vậy."
        },
        careers: {
            file: 'decks/careerInterests.json',
            title: " Sở thích nghề nghiệp",
            subtitle: "Bộ thẻ là công cụ giúp sắp xếp thứ tự ưu tiên hơn 100 nghề nghiệp tiềm năng. Đây là phương pháp hiệu quả để tìm hiểu rộng hơn về sở thích cá nhân hoặc tìm cách thay đổi nghề nghiệp.",
            instructions: "Giả sử: Bạn đi nghỉ tại một khu nghỉ mát lớn, nhiệm vụ của bạn là tìm ra những vị khách mà bạn muốn tương tác nhất. Điều gì ở nghề nghiệp của họ thu hút bạn?<br/>👉 Sắp xếp các thẻ vào các cột phù hợp."
        },
        disc: {
        file: 'decks/DISC.json',
        title: "📊 DISC - Tính cách và hành vi",
        subtitle: "Khám phá phong cách làm việc và giao tiếp tự nhiên của bạn",
        instructions: "Đọc từng phát biểu và xếp vào cột phù hợp nhất với con người thật của bạn. Không có câu trả lời đúng hay sai."
}
    },
    SUBMIT_SHEET_URL: "https://script.google.com/macros/s/AKfycbx8U1W7b3pCzD8VkN6UwEk1QBs9Jj9sA9TwqNOlDFAXzd6A4-HCZ9c2vESkqs64DVuTRw/exec",
    ADMIN_API_URL: "https://script.google.com/macros/s/AKfycbx8U1W7b3pCzD8VkN6UwEk1QBs9Jj9sA9TwqNOlDFAXzd6A4-HCZ9c2vESkqs64DVuTRw/exec",

};