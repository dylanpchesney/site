#!/usr/bin/env python3
"""Local portfolio CMS server. Serves the site and saves portfolio.json."""

from __future__ import annotations

import json
import mimetypes
import os
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parent
PORTFOLIO_FILE = ROOT / "portfolio.json"
PORT = int(os.environ.get("PORT", "3000"))


class CMSHandler(BaseHTTPRequestHandler):
    def log_message(self, format: str, *args) -> None:
        print(f"[cms] {self.address_string()} - {format % args}")

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_GET(self) -> None:
        if self.path.split("?", 1)[0] == "/api/portfolio":
            self.handle_portfolio_get()
            return
        self.serve_static()

    def do_PUT(self) -> None:
        if self.path.split("?", 1)[0] == "/api/portfolio":
            self.handle_portfolio_put()
            return
        self.send_error(405, "Method Not Allowed")

    def handle_portfolio_get(self) -> None:
        try:
            if PORTFOLIO_FILE.exists():
                payload = PORTFOLIO_FILE.read_text(encoding="utf-8")
            else:
                payload = json.dumps({"articles": []}, indent=2)
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(payload.encode("utf-8"))
        except OSError as error:
            self.send_json(500, {"error": f"Could not read portfolio.json: {error}"})

    def handle_portfolio_put(self) -> None:
        try:
            length = int(self.headers.get("Content-Length", "0"))
            body = self.rfile.read(length).decode("utf-8")
            data = json.loads(body)

            if not isinstance(data, dict) or not isinstance(data.get("articles"), list):
                self.send_json(400, {"error": "portfolio.json must contain an articles array."})
                return

            PORTFOLIO_FILE.write_text(
                json.dumps(data, indent=2) + "\n",
                encoding="utf-8",
            )
            self.send_json(200, {"ok": True, "count": len(data["articles"])})
        except json.JSONDecodeError:
            self.send_json(400, {"error": "Invalid JSON payload."})
        except OSError as error:
            self.send_json(500, {"error": f"Could not save portfolio.json: {error}"})

    def send_json(self, status: int, payload: dict) -> None:
        encoded = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)

    def serve_static(self) -> None:
        request_path = unquote(self.path.split("?", 1)[0])
        relative = "index.html" if request_path == "/" else request_path.lstrip("/")
        file_path = (ROOT / relative).resolve()

        if not str(file_path).startswith(str(ROOT)):
            self.send_error(403, "Forbidden")
            return

        if file_path.is_dir():
            file_path = file_path / "index.html"

        if not file_path.exists() or not file_path.is_file():
            self.send_error(404, "File not found")
            return

        content_type, _ = mimetypes.guess_type(str(file_path))
        content_type = content_type or "application/octet-stream"

        try:
            data = file_path.read_bytes()
            self.send_response(200)
            self.send_header("Content-Type", content_type)
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
        except OSError:
            self.send_error(500, "Server error")


def main() -> None:
    server = HTTPServer(("127.0.0.1", PORT), CMSHandler)
    print(f"Portfolio CMS running at http://localhost:{PORT}/local-cms.html")
    print("Edits save directly to portfolio.json in this folder.")
    print("Press Ctrl+C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")


if __name__ == "__main__":
    main()
