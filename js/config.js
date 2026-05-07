// js/config.js - Cấu hình game
const CONFIG = {
    // ĐÃ XÓA URL GOOGLE SHEETS - CHỈ DÙNG FILE JSON
    
    // Các mức độ quan tâm (5 cột)
    LEVELS: [
        { name: "Không quan tâm", level: 0, color: "#ffebee", borderColor: "#ff6b6b" },
        { name: "Quan tâm một chút", level: 1, color: "#fff3e0", borderColor: "#ffa500" },
        { name: "Bình thường", level: 2, color: "#e8f5e9", borderColor: "#4caf50" },
        { name: "Quan tâm", level: 3, color: "#e3f2fd", borderColor: "#2196f3" },
        { name: "Luôn luôn quan tâm", level: 4, color: "#f3e5f5", borderColor: "#9c27b0" }
    ],
    
    // Giới hạn số thẻ tối đa cho cột đầu và cột cuối
    MAX_CARDS_SPECIAL_COLUMN: 10,
    
    // Cột có giới hạn (cột 0 và cột 4)
    SPECIAL_COLUMNS: [0, 4],
    
    // Bộ thẻ mặc định (có thể đổi)
    CURRENT_DECK: 'career',
    
    // Thông tin các bộ thẻ
    GAME_INFO: {
        career: {
            file: 'decks/careerValues.json',
            title: "🎯 Giá trị nghề nghiệp",
            subtitle: "Sắp xếp các giá trị theo mức độ quan trọng với bạn",
            instructions: "👉 Kéo mỗi giá trị vào cột phù hợp nhất với bạn"
        },
        entertainment: {
            file: 'decks/entertainment.json',
            title: "🎬 Hoạt động giải trí",
            subtitle: "Sắp xếp các hoạt động theo mức độ yêu thích",
            instructions: "👉 Kéo hoạt động vào cột phù hợp với sở thích của bạn"
        },
        skills: {
            file: 'decks/motivatingSkills.json',
            title: "⚡ Kỹ năng tạo động lực",
            subtitle: "Đánh giá kỹ năng theo mức độ thành thạo",
            instructions: "👉 Kéo mỗi kỹ năng vào cột mô tả đúng trình độ của bạn"
        },
        careers: {
            file: 'decks/careerInterests.json',
            title: "💼 Ngành nghề quan tâm",
            subtitle: "Sắp xếp ngành nghề theo mức độ phù hợp",
            instructions: "👉 Kéo ngành nghề vào cột mô tả đúng với bạn nhất"
        }
    }
};