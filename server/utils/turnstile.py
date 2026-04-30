import os
import requests
from functools import wraps
from flask import request, jsonify


def _verify_turnstile(token: str, ip: str) -> bool:
    resp = requests.post(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        data={
            "secret": os.environ.get("TURNSTILE_SECRET_KEY"),
            "response": token,
            "remoteip": ip,
        },
        timeout=5,
    )
    return resp.json().get("success", False)


def require_turnstile(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not os.environ.get("TURNSTILE_SECRET_KEY"):
            return f(*args, **kwargs)
        token = request.headers.get("X-Turnstile-Token")
        if not token or token == "dev-bypass":
            return jsonify({"status": 403, "errors": ["Missing verification token"]}), 403
        if not _verify_turnstile(token, request.remote_addr):
            return jsonify({"status": 403, "errors": ["Verification failed"]}), 403
        return f(*args, **kwargs)
    return decorated
