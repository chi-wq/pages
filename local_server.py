#!/usr/bin/env python3
"""Local Jekyll preview server with baseurl support and video streaming

Usage:
    python server.py

Then visit http://127.0.0.1:4000/pages/
"""

import http.server
import sys
import os
import urllib.parse
import socket
import contextlib
import socketserver

SITE_DIR = os.path.join(os.path.dirname(__file__) or '.', '_site')
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 4000
BASEURL = '/pages'


def free_port(port):
    """Kill any process occupying the given port"""
    if sys.platform == 'win32':
        import subprocess
        result = subprocess.run(
            f'netstat -ano | findstr ":{port}"',
            capture_output=True, text=True, shell=True
        )
        for line in result.stdout.splitlines():
            parts = line.strip().split()
            if len(parts) >= 5 and 'LISTENING' in line:
                pid = parts[-1]
                try:
                    os.system(f'taskkill /F /PID {pid} >nul 2>&1')
                    print(f'  Freed port {port} (PID {pid})')
                except:
                    pass


class JekyllHandler(http.server.SimpleHTTPRequestHandler):
    """Maps /pages/... paths to the _site root directory"""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=SITE_DIR, **kwargs)

    def translate_path(self, path):
        # Strip /pages prefix and map to _site root
        parsed = urllib.parse.urlparse(path)
        clean = parsed.path
        if clean.startswith(BASEURL):
            clean = clean[len(BASEURL):] or '/'
        return super().translate_path(clean)

    def log_message(self, format, *args):
        # Skip verbose video request logs
        msg = format % args
        if 'videos/' in msg:
            return
        sys.stderr.write('[%s] %s - %s\n' % (
            self.log_date_time_string(),
            self.client_address[0],
            msg
        ))

    def handle_one_request(self):
        """Silently handle ConnectionResetError during video streaming"""
        try:
            super().handle_one_request()
        except (ConnectionResetError, ConnectionAbortedError, BrokenPipeError):
            # Client disconnecting mid-stream is normal for video files
            self.close_connection = True


if __name__ == '__main__':
    if not os.path.isdir(SITE_DIR):
        sys.stderr.write('Error: _site directory not found. Run "bundle exec jekyll build" first.\n')
        sys.exit(1)

    free_port(PORT)

    server = socketserver.ThreadingTCPServer(('127.0.0.1', PORT), JekyllHandler)
    server.allow_reuse_address = True
    print('Server started:')
    print('  http://127.0.0.1:%d%s/' % (PORT, BASEURL))
    print('Press Ctrl+C to stop')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nServer stopped')
        server.server_close()
