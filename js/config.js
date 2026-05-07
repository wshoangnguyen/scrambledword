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
            title: " Giá trị nghề nghiệp",
            subtitle: "Giúp người đang tìm việc, hoặc muốn thay đổi công việc, tìm được môi trường phù hợp với niềm tin và mong muốn cá nhân.",
            instructions: "Đọc 54 thẻ giá trị và đặt vào các cột tương ứng.\nLưu ý: Cột 'Luôn luôn coi trọng' không nên có quá 10 thẻ.\nThực hiện nhanh theo cảm giác và ý tưởng đầu tiên nảy ra."
        },
        entertainment: {
            file: 'decks/entertainment.json',
            title: " Hoạt động giải trí",
            subtitle: "Công cụ này giúp bạn xác định mức độ hài lòng với các hoạt động giải trí, tìm ra sự tương đồng hoặc khác biệt giữa bạn và người thân/đối tác, từ đó áp dụng vào các quyết định nghỉ hưu trong tương lai.",
            instructions: "Giả sử: Bạn được thông báo là mình không cần đi làm nữa nhưng vẫn được nhận lương đầy đủ trong 30 năm tới.\nBạn sẽ làm gì để lấp đầy khoảng thời gian 8 tiếng làm việc mỗi ngày như trước kia?\nBạn nên thực hiện xếp thẻ một mình trước khi chia sẻ và thảo luận với người thân."
        },
        skills: {
            file: 'decks/motivatingSkills.json',
            title: " Kỹ năng tạo động lực",
            subtitle: "Vừa làm cực giỏi, vừa thấy cực vui! Khi làm những việc đó, con sẽ giống như một siêu anh hùng đang sử dụng siêu năng lực của mình vậy.",
            instructions: "Có những việc con làm rất giỏi nhưng lại thấy chán (như việc dọn đồ chơi).\nCó những việc con rất thích làm nhưng lại chưa giỏi lắm (như việc tập bơi).\nMục tiêu của chúng ta là tìm ra những việc nằm ở 'điểm vàng': Vừa làm cực giỏi, vừa thấy cực vui!\n Khi làm những việc đó, con sẽ giống như một siêu anh hùng đang sử dụng siêu năng lực của mình vậy."
        },
        careers: {
            file: 'decks/careerInterests.json',
            title: " Sở thích nghề nghiệp",
            subtitle: "Bộ thẻ là công cụ giúp sắp xếp thứ tự ưu tiên hơn 100 nghề nghiệp tiềm năng. Đây là phương pháp hiệu quả để tìm hiểu rộng hơn về sở thích cá nhân hoặc tìm cách thay đổi nghề nghiệp.",
            instructions: "Giả sử: Bạn đi nghỉ tại một khu nghỉ mát lớn, nhiệm vụ của bạn là tìm ra những vị khách mà bạn muốn tương tác nhất. Điều gì ở nghề nghiệp của họ thu hút bạn?\n👉 Sắp xếp các thẻ vào các cột phù hợp. Không giới hạn số lượng thẻ ở mỗi cột (tuy nhiên nên cố gắng chọn ra khoảng 20 thẻ cho mục 'Rất quan tâm')."
        }
    }
};