const fs = require("fs");
const path = require("path");

const convertedFolder = path.join(__dirname, "../uploads/converted/");
const ONE_HOUR = 60 * 60 * 1000; // 1시간 (밀리초 단위)

// 변환된 파일 자동 삭제 함수
function cleanupOldFiles() {
  fs.readdir(convertedFolder, (err, files) => {
    if (err) {
      console.error("❌ 변환 파일 삭제 중 오류 발생:", err);
      return;
    }

    const now = Date.now();

    files.forEach((file) => {
      const filePath = path.join(convertedFolder, file);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error("❌ 파일 정보 조회 오류:", err);
          return;
        }

        if (now - stats.mtimeMs > ONE_HOUR) {
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error("❌ 파일 삭제 오류:", err);
            } else {
              console.log(`🗑️ 삭제됨: ${filePath}`);
            }
          });
        }
      });
    });
  });
}

// 1시간마다 실행
setInterval(cleanupOldFiles, ONE_HOUR);

module.exports = { cleanupOldFiles };
