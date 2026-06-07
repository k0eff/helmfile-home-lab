#!/usr/bin/env python3

import argparse
import base64
import getpass
import json
import os
import re
import ssl
import sys
import urllib.error
import urllib.parse
import urllib.request
from http.cookiejar import Cookie, CookieJar


def utf16to8_bytes(value: str) -> bytes:
    out = bytearray()
    for ch in value:
        codepoint = ord(ch)
        if 1 <= codepoint <= 127:
            out.append(codepoint)
        elif codepoint > 2047:
            out.extend(
                [
                    224 | ((codepoint >> 12) & 15),
                    128 | ((codepoint >> 6) & 63),
                    128 | (codepoint & 63),
                ]
            )
        else:
            out.extend(
                [
                    192 | ((codepoint >> 6) & 31),
                    128 | (codepoint & 63),
                ]
            )
    return bytes(out)


def qnap_password_encode(password: str) -> str:
    return base64.b64encode(utf16to8_bytes(password)).decode()


def add_cookie(jar: CookieJar, name: str, value: str, domain: str, path: str = "/") -> None:
    jar.set_cookie(
        Cookie(
            version=0,
            name=name,
            value=value,
            port=None,
            port_specified=False,
            domain=domain,
            domain_specified=True,
            domain_initial_dot=False,
            path=path,
            path_specified=True,
            secure=True,
            expires=None,
            discard=True,
            comment=None,
            comment_url=None,
            rest={},
            rfc2109=False,
        )
    )


class QuMagieClient:
    def __init__(self, base_url: str, username: str, password: str) -> None:
        self.base_url = base_url.rstrip("/")
        parsed = urllib.parse.urlparse(self.base_url)
        self.domain = parsed.hostname or ""
        self.cookie_jar = CookieJar()
        self.ssl_context = ssl._create_unverified_context()
        self.opener = urllib.request.build_opener(
            urllib.request.HTTPSHandler(context=self.ssl_context),
            urllib.request.HTTPCookieProcessor(self.cookie_jar),
        )
        self.username = username
        self.password = password
        self.common_headers = {
            "User-Agent": "Mozilla/5.0",
            "X-Requested-With": "XMLHttpRequest",
            "Referer": f"{self.base_url}/qumagie/",
            "Accept": "application/json, text/plain, */*",
        }

    def request(self, path: str, method: str = "GET", form: dict | None = None, headers: dict | None = None) -> bytes:
        body = None
        req_headers = dict(self.common_headers)
        if headers:
            req_headers.update(headers)
        if form is not None:
            body = urllib.parse.urlencode(form).encode()
            req_headers.setdefault("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8")
        req = urllib.request.Request(
            urllib.parse.urljoin(f"{self.base_url}/", path.lstrip("/")),
            data=body,
            method=method,
            headers=req_headers,
        )
        with self.opener.open(req, timeout=30) as response:
            return response.read()

    def login(self) -> None:
        self.request("/cgi-bin/login.html?app=qumagie", headers={"Referer": f"{self.base_url}/cgi-bin/login.html?app=qumagie"})
        response = self.request(
            "/cgi-bin/authLogin.cgi",
            method="POST",
            form={
                "user": self.username,
                "serviceKey": "1",
                "client_agent": "Mozilla/5.0",
                "client_app": "Web Desktop",
                "pwd": qnap_password_encode(self.password),
                "gen_client_id": "1",
                "check_privilege": "qumagie",
            },
            headers={
                "Origin": self.base_url,
                "Referer": f"{self.base_url}/cgi-bin/login.html?app=qumagie",
            },
        ).decode("utf-8", "ignore")

        if "<authPassed><![CDATA[1]]></authPassed>" not in response and "<authPassed>1</authPassed>" not in response:
            raise RuntimeError("QNAP login did not return authPassed=1")

        auth_sid_match = re.search(r"<authSid><!\[CDATA\[(.*?)\]\]></authSid>|<authSid>(.*?)</authSid>", response)
        if not auth_sid_match:
            raise RuntimeError("QNAP login did not return authSid")

        auth_sid = auth_sid_match.group(1) or auth_sid_match.group(2)
        add_cookie(self.cookie_jar, "NAS_SID", auth_sid, domain=self.domain)

    def list_latest_media(self, limit: int) -> list[dict]:
        rows: list[dict] = []
        offset = 0

        while len(rows) < limit:
            response = json.loads(
                self.request(f"/qumagie/api/v1/list/allMedia?sortKey=time&sd=desc&offset={offset}").decode(
                    "utf-8", "ignore"
                )
            )
            if str(response.get("status")) != "0":
                raise RuntimeError(f"allMedia returned status={response.get('status')} at offset={offset}")

            batch = response.get("DataList", [])
            if not isinstance(batch, list):
                raise RuntimeError("allMedia returned no DataList array")
            if not batch:
                break

            rows.extend(batch)
            offset += len(batch)

        return rows[:limit]

    @staticmethod
    def build_display_thumb_path(file_item: dict) -> str:
        path = f"/qumagie/api/thumb.php?m=display&f={urllib.parse.quote(str(file_item['id']))}&t=photo"
        if file_item.get("thumb4k"):
            path += "&s=4k"
        if file_item.get("LastUpdate"):
            path += "&_t=" + urllib.parse.quote(str(file_item["LastUpdate"]))
        if file_item.get("code"):
            path += "&ac=" + urllib.parse.quote(str(file_item["code"]))
        return path

    def probe_display_thumb(self, file_item: dict) -> dict:
        path = self.build_display_thumb_path(file_item)
        req = urllib.request.Request(
            urllib.parse.urljoin(f"{self.base_url}/", path.lstrip("/")),
            headers={"User-Agent": "Mozilla/5.0", "Referer": f"{self.base_url}/qumagie/"},
        )
        try:
            with self.opener.open(req, timeout=30) as response:
                blob = response.read(16)
                return {
                    "path": path,
                    "status": response.status,
                    "content_type": response.headers.get("content-type"),
                    "magic": blob[:4].hex(),
                }
        except urllib.error.HTTPError as exc:
            if exc.code != 401:
                raise

        self.login()
        with self.opener.open(req, timeout=30) as response:
            blob = response.read(16)
            return {
                "path": path,
                "status": response.status,
                "content_type": response.headers.get("content-type"),
                "magic": blob[:4].hex(),
            }


def main() -> int:
    parser = argparse.ArgumentParser(description="Probe authenticated QuMagie latest-media listing and thumbnail display URLs.")
    parser.add_argument("--base-url", required=True)
    parser.add_argument("--username", required=True)
    parser.add_argument("--password")
    parser.add_argument("--password-stdin", action="store_true")
    parser.add_argument("--password-env", default="QUMAGIE_PASSWORD")
    parser.add_argument("--count", type=int, default=5, help="How many latest media rows to inspect.")
    parser.add_argument("--probe-images", type=int, default=3, help="How many image thumbnails to validate.")
    parser.add_argument("--probe-all-images", action="store_true", help="Validate thumbnails for every listed image row.")
    parser.add_argument("--report-samples", type=int, default=10, help="How many successful thumbnail probes to keep in the final JSON output.")
    args = parser.parse_args()

    if args.password_stdin:
        if sys.stdin.isatty():
            password = getpass.getpass("QuMagie password: ")
        else:
            password = sys.stdin.read().rstrip("\n")
    else:
        password = args.password or os.environ.get(args.password_env)

    if not password:
        raise RuntimeError("Password must be provided via --password or --password-stdin")

    client = QuMagieClient(args.base_url, args.username, password)
    client.login()
    rows = client.list_latest_media(args.count)

    file_items = [row["FileItem"] for row in rows if isinstance(row, dict) and isinstance(row.get("FileItem"), dict)]
    image_items = [item for item in file_items if item.get("MediaType") == "photo"]

    result = {
        "listed_rows": len(rows),
        "image_rows": len(image_items),
        "sample_images": [],
    }

    probe_items = image_items if args.probe_all_images else image_items[: args.probe_images]

    for index, file_item in enumerate(probe_items, start=1):
        thumb_probe = client.probe_display_thumb(file_item)
        if len(result["sample_images"]) < args.report_samples:
            result["sample_images"].append(
                {
                    "name": file_item.get("cFileName"),
                    "mime": file_item.get("mime"),
                    "id": file_item.get("id"),
                    "thumb_probe": thumb_probe,
                }
            )

        if thumb_probe["status"] != 200 or thumb_probe["content_type"] != "image/jpeg" or thumb_probe["magic"] != "ffd8ffe0":
            raise RuntimeError(f"Unexpected thumbnail probe result for {file_item.get('cFileName')}: {thumb_probe}")

        if args.probe_all_images and index % 50 == 0:
            print(json.dumps({"progress": {"checked_images": index, "target": len(probe_items)}}), flush=True)

    print(json.dumps(result, indent=2))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(json.dumps({"error": str(exc)}))
        raise
