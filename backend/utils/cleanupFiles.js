const fs = require("fs");
const path = require("path");

const convertedFolder = path.resolve(__dirname, "../uploads/converted/");
const ONE_HOUR = 60 * 60 * 1000; // 1시간 (밀리초 단위)

// 변환된 파일 자동 삭제 함수
function cleanupOldFiles() {
  if (!fs.existsSync(convertedFolder)) {
    console.log(`📂 변환 폴더가 존재하지 않아 생성합니다: ${convertedFolder}`);
    fs.mkdirSync(convertedFolder, { recursive: true });
  }

  if (!fs.existsSync(convertedFolder)) {
    console.log(
      `📂 변환 폴더가 존재하지 않아 삭제 작업을 건너뜁니다: ${convertedFolder}`
    );
    return;
  }

  if (!fs.existsSync(convertedFolder)) {
    console.log(
      `📂 변환 폴더가 존재하지 않아 삭제 작업을 건너뜁니다: ${convertedFolder}`
    );
    return;
  }

  fs.readdir(convertedFolder, (err, files) => {
    if (err) {
      if (err.code === "ENOENT") {
        console.log(
          `📂 변환 폴더가 비어 있거나 존재하지 않음, 삭제 작업 건너뜀: ${convertedFolder}`
        );
        return;
      }
      console.error("❌ 변환 파일 삭제 중 오류 발생:", err);
      return;
    }

    if (files.length === 0) {
      console.log(
        `📂 변환 폴더는 존재하지만, 삭제할 파일이 없음: ${convertedFolder}`
      );
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
              console.log(`🗑 삭제됨: ${filePath}`);
            }
          });
        }
      });
    });
  });
}

module.exports = { cleanupOldFiles };
