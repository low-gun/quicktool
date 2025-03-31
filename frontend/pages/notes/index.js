import { useEffect, useState } from "react";
import Toast from "../../components/Toast";
import { useRouter } from "next/router";

export default function NotesPage() {
  const [notes, setNotes] = useState([]); // [{ id, note, updated_at }, ...]
  const [newNote, setNewNote] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const router = useRouter();

  // 수정 중인 메모 상태
  // editingNoteId: 현재 편집 모드인 메모의 id (없으면 null)
  // editingContent: 편집 중인 textarea 내용
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingContent, setEditingContent] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setToastMsg("로그인이 필요합니다.");
      router.push("/login");
      return;
    }
    fetchNotes(token);
  }, []);

  // 토스트 닫기
  const handleCloseToast = () => setToastMsg("");

  // 메모 목록 불러오기 (GET /api/notes)
  const fetchNotes = async (token) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("메모 불러오기 실패");
      const data = await res.json();
      setNotes(data.notes || []);
    } catch (err) {
      setToastMsg(`오류: ${err.message}`);
    }
  };

  // 새 메모 저장 (POST /api/notes)
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ note: newNote }),
      });
      if (!res.ok) throw new Error("메모 작성 실패");
      await res.json();
      setToastMsg("메모가 저장되었습니다.");
      setNewNote("");
      fetchNotes(token); // 다시 목록 갱신
    } catch (err) {
      setToastMsg(`오류: ${err.message}`);
    }
  };

  // 메모 삭제 (DELETE /api/notes/:id)
  const handleDelete = async (noteId) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notes/${noteId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("메모 삭제 실패");
      setToastMsg("메모가 삭제되었습니다.");
      // 다시 목록 갱신
      fetchNotes(token);
    } catch (err) {
      setToastMsg(`삭제 오류: ${err.message}`);
    }
  };

  // 편집 모드로 진입
  const handleEdit = (item) => {
    setEditingNoteId(item.id);
    setEditingContent(item.note); // 기존 메모 내용을 편집창에 세팅
  };

  // 편집 취소
  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditingContent("");
  };

  // 편집 내용 저장 (PUT /api/notes/:id)
  const handleUpdate = async (noteId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notes/${noteId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ note: editingContent }),
        }
      );
      if (!res.ok) throw new Error("메모 수정 실패");
      setToastMsg("메모가 수정되었습니다.");
      setEditingNoteId(null);
      setEditingContent("");
      fetchNotes(token);
    } catch (err) {
      setToastMsg(`수정 오류: ${err.message}`);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "50px auto" }}>
      <Toast message={toastMsg} onClose={handleCloseToast} />

      <h2>내 메모들</h2>
      {notes.map((item) => (
        <div
          key={item.id}
          style={{
            border: "1px solid #ccc",
            marginBottom: "10px",
            padding: "10px",
          }}
        >
          {/* 편집 중인 메모인지 여부 확인 */}
          {editingNoteId === item.id ? (
            // 편집 모드
            <div>
              <textarea
                style={{ width: "100%", height: "60px" }}
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
              />
              <div style={{ marginTop: "5px" }}>
                <button
                  onClick={() => handleUpdate(item.id)}
                  style={{ marginRight: "10px" }}
                >
                  저장
                </button>
                <button onClick={handleCancelEdit}>취소</button>
              </div>
            </div>
          ) : (
            // 일반 모드
            <>
              <p>{item.note}</p>
              <small>업데이트: {item.updated_at}</small>
              <div style={{ marginTop: "5px" }}>
                <button
                  style={{ marginRight: "10px" }}
                  onClick={() => handleEdit(item)}
                >
                  편집
                </button>
                <button onClick={() => handleDelete(item.id)}>삭제</button>
              </div>
            </>
          )}
        </div>
      ))}

      <hr />
      <h3>새 메모 작성</h3>
      <textarea
        value={newNote}
        onChange={(e) => setNewNote(e.target.value)}
        style={{ width: "100%", height: "80px" }}
      />
      <button onClick={handleSave}>저장</button>
    </div>
  );
}
