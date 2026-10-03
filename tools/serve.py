#!/usr/bin/env python3
"""Serve the game locally for development, telling the browser never to cache, so every reload
shows your latest edits. Usage: python3 tools/serve.py [port]   (default 8765)"""
import http.server, os, sys

class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()
    def log_message(self, *args):
        pass

os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
print(f'Word Path on http://127.0.0.1:{port}/  (checks: /tests/, test mode: /?test)')
http.server.ThreadingHTTPServer(('127.0.0.1', port), NoCache).serve_forever()
