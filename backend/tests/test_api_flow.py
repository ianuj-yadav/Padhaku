"""Local integration checks for the account-owned study workflow.

Run from backend/: python -m unittest discover -s tests -v
The test uses a temporary SQLite database and removes it when the process exits.
"""

from __future__ import annotations

import os
import tempfile
import unittest
from pathlib import Path


_TEMP_DIR = tempfile.TemporaryDirectory(prefix="padhaku-api-test-")
_DB_PATH = Path(_TEMP_DIR.name, "test.sqlite3").as_posix()
os.environ["DATABASE_URL"] = f"sqlite+aiosqlite:///{_DB_PATH}"
os.environ["COOKIE_SECURE"] = "false"

from fastapi.testclient import TestClient
from app.main import app


def _one_page_pdf(text: str) -> bytes:
    """Build a tiny valid PDF with a selectable text line, without extra tools."""
    escaped = text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
    stream = f"BT /F1 12 Tf 72 720 Td ({escaped}) Tj ET".encode("ascii")
    objects = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
        b"<< /Length " + str(len(stream)).encode("ascii") + b" >>\nstream\n" + stream + b"\nendstream",
    ]
    pdf = bytearray(b"%PDF-1.4\n")
    offsets = [0]
    for number, body in enumerate(objects, start=1):
        offsets.append(len(pdf))
        pdf.extend(f"{number} 0 obj\n".encode("ascii") + body + b"\nendobj\n")
    xref_offset = len(pdf)
    pdf.extend(f"xref\n0 {len(objects) + 1}\n".encode("ascii"))
    pdf.extend(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        pdf.extend(f"{offset:010d} 00000 n \n".encode("ascii"))
    pdf.extend(
        f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref_offset}\n%%EOF\n".encode("ascii")
    )
    return bytes(pdf)


class StudyWorkflowTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.client = TestClient(app)
        cls.client.__enter__()

    @classmethod
    def tearDownClass(cls) -> None:
        cls.client.__exit__(None, None, None)
        _TEMP_DIR.cleanup()

    def test_account_owned_study_flow(self) -> None:
        client = self.client
        self.assertEqual(client.get("/health").json()["status"], "ok")

        unauthenticated = TestClient(app)
        self.assertEqual(unauthenticated.get("/api/notes").status_code, 401)
        unauthenticated.close()

        first = client.post("/api/auth", json={
            "action": "register_complete", "email": "student@example.test", "password": "study-password-123",
            "name": "Test Student", "university": "Test University", "course": "Computer Science",
            "semester": "Semester 1", "subjects": ["Databases"],
        })
        self.assertEqual(first.status_code, 200, first.text)
        self.assertTrue(client.cookies.get("padhaku_session"))
        self.assertEqual(client.get("/api/me").json()["user"]["email"], "student@example.test")

        note = client.post("/api/notes", json={"title": "Indexes", "content": "B-trees", "subject": "Databases"})
        self.assertEqual(note.status_code, 200, note.text)
        note_id = note.json()["note"]["id"]
        self.assertEqual(client.get("/api/notes").json()["notes"][0]["id"], note_id)

        task = client.post("/api/tasks", json={"id": "test-task", "title": "Review indexes", "priority": "High"})
        self.assertEqual(task.status_code, 200, task.text)
        self.assertEqual(client.get("/api/tasks").json()["tasks"][0]["title"], "Review indexes")

        attempt = client.post("/api/quiz-attempts", json={"score": 1, "total": 2, "answers": {"q1": "a"}})
        self.assertEqual(attempt.status_code, 200, attempt.text)
        self.assertEqual(client.get("/api/quiz-attempts").json()["attempts"][0]["score"], 1)

        pdf = _one_page_pdf("Statistical inference uses sample data to estimate population properties.")
        upload = client.post("/api/documents", files={"file": ("inference.pdf", pdf, "application/pdf")})
        self.assertEqual(upload.status_code, 200, upload.text)
        doc = upload.json()["document"]
        self.assertEqual(doc["pages"], 1)
        self.assertEqual(client.get("/api/documents").json()["documents"][0]["id"], doc["id"])
        answer = client.post("/api/ai/ask", json={"question": "Explain statistical inference", "document_id": doc["id"]})
        self.assertEqual(answer.status_code, 200, answer.text)
        self.assertTrue(answer.json()["sources"])
        self.assertEqual(answer.json()["sources"][0]["pageNumber"], 1)

        with TestClient(app) as second:
            second_register = second.post("/api/auth", json={
                "action": "register_complete", "email": "other@example.test", "password": "other-password-123",
            })
            self.assertEqual(second_register.status_code, 200, second_register.text)
            cross_account = second.post("/api/notes", json={"id": note_id, "title": "Overwrite", "content": "not allowed"})
            self.assertEqual(cross_account.status_code, 404)
            self.assertEqual(len(second.get("/api/notes").json()["notes"]), 0)

        logout = client.post("/api/logout")
        self.assertEqual(logout.status_code, 200, logout.text)
        self.assertEqual(client.get("/api/notes").status_code, 401)


if __name__ == "__main__":
    unittest.main()
