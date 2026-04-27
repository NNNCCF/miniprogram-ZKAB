import argparse
import hashlib
import json
import random
import string
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from typing import Any, Dict, Iterable, Optional, Tuple

try:
    import paho.mqtt.client as mqtt
except ImportError:
    print("Missing dependency: paho-mqtt")
    print("Install it with: pip install paho-mqtt")
    sys.exit(1)


DEFAULT_API_ORIGIN = "https://116.204.127.178"
DEFAULT_MINI_CLIENT_ID = "zkab-miniapp"
DEFAULT_MINI_SHARED_SECRET = "change-me-miniapp-shared-secret"

DEFAULT_DEVICE_ID = "DEV-MINI-001"
DEFAULT_MQTT_USERNAME = "DEV-MINI-001"
DEFAULT_MQTT_PASSWORD = "HvBABsArDz7L5XMqyMAXCD0sUzdZSu6m"


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def sha256_hex(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def stable_stringify(value: Any) -> str:
    if value is None or isinstance(value, (str, int, float, bool)):
        return json.dumps(value, ensure_ascii=False, separators=(",", ":"))
    if isinstance(value, list):
        return "[" + ",".join(stable_stringify(item) for item in value) + "]"
    if isinstance(value, dict):
        items = []
        for key in sorted(value.keys(), key=lambda k: str(k)):
            key_str = str(key)
            items.append(
                f"{json.dumps(key_str, ensure_ascii=False, separators=(',', ':'))}:{stable_stringify(value[key])}"
            )
        return "{" + ",".join(items) + "}"
    raise TypeError(f"Unsupported type in stable_stringify: {type(value)}")


def stringify_query_value(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, (dict, list)):
        return stable_stringify(value)
    return str(value)


def build_canonical_query(data: Optional[Dict[str, Any]]) -> str:
    if not data:
        return ""

    pairs = []
    for key in sorted(data.keys(), key=lambda k: str(k)):
        raw_value = data[key]
        if isinstance(raw_value, list):
            for item in raw_value:
                pairs.append(
                    f"{urllib.parse.quote(str(key), safe='')}="
                    f"{urllib.parse.quote(stringify_query_value(item), safe='')}"
                )
            continue
        pairs.append(
            f"{urllib.parse.quote(str(key), safe='')}="
            f"{urllib.parse.quote(stringify_query_value(raw_value), safe='')}"
        )
    return "&".join(pairs)


def base36(num: int) -> str:
    chars = "0123456789abcdefghijklmnopqrstuvwxyz"
    if num == 0:
        return "0"
    out = []
    while num > 0:
        num, rem = divmod(num, 36)
        out.append(chars[rem])
    return "".join(reversed(out))


def create_nonce() -> str:
    now = int(time.time() * 1000)
    rand = "".join(random.choice(string.ascii_lowercase + string.digits) for _ in range(8))
    return f"{base36(now)}{rand}"


def build_signature_headers(
    method: str,
    request_path: str,
    query: str,
    body: str,
    mini_client_id: str,
    mini_shared_secret: str,
) -> Dict[str, str]:
    timestamp = str(int(time.time() * 1000))
    nonce = create_nonce()
    payload = "\n".join(
        [
            mini_client_id,
            timestamp,
            nonce,
            method.upper(),
            request_path,
            query,
            sha256_hex(body),
            mini_shared_secret,
        ]
    )
    return {
        "X-Mini-Client-Id": mini_client_id,
        "X-Mini-Timestamp": timestamp,
        "X-Mini-Nonce": nonce,
        "X-Mini-Signature": sha256_hex(payload),
    }


def parse_json_bytes(raw: bytes) -> Any:
    text = raw.decode("utf-8", errors="replace")
    if not text:
        return None
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return text


def normalize_api_result(payload: Any) -> Any:
    if isinstance(payload, dict) and "code" in payload:
        if payload.get("code") == 0:
            return payload.get("data")
        message = payload.get("message") or payload.get("msg") or "API request failed"
        raise RuntimeError(str(message))
    return payload


def api_request(
    api_origin: str,
    mini_client_id: str,
    mini_shared_secret: str,
    path: str,
    method: str = "GET",
    params: Optional[Dict[str, Any]] = None,
    data: Optional[Dict[str, Any]] = None,
    token: Optional[str] = None,
    timeout: int = 15,
) -> Any:
    norm_path = path if path.startswith("/") else f"/{path}"
    method_up = method.upper()

    query = build_canonical_query(params) if method_up == "GET" else ""
    request_path = f"/api{norm_path}"
    request_url = f"{api_origin.rstrip('/')}/api{norm_path}"
    if query:
        request_url = f"{request_url}?{query}"

    body = "" if method_up == "GET" or data is None else stable_stringify(data)
    headers = {
        "Content-Type": "application/json",
        **build_signature_headers(
            method=method_up,
            request_path=request_path,
            query=query,
            body=body,
            mini_client_id=mini_client_id,
            mini_shared_secret=mini_shared_secret,
        ),
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"

    req = urllib.request.Request(
        url=request_url,
        method=method_up,
        data=(body.encode("utf-8") if body else None),
        headers=headers,
    )

    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            payload = parse_json_bytes(resp.read())
            return normalize_api_result(payload)
    except urllib.error.HTTPError as exc:
        payload = parse_json_bytes(exc.read())
        if isinstance(payload, dict):
            message = payload.get("message") or payload.get("msg") or payload
        else:
            message = payload or str(exc)
        raise RuntimeError(f"HTTP {exc.code}: {message}") from exc


def normalize_key(key: str) -> str:
    return "".join(ch for ch in key.lower() if ch.isalnum())


def find_value(payload: Any, aliases: Iterable[str]) -> Any:
    alias_set = {normalize_key(alias) for alias in aliases}
    queue = [payload]

    while queue:
        current = queue.pop(0)
        if isinstance(current, dict):
            for key, value in current.items():
                if normalize_key(str(key)) in alias_set and value not in (None, ""):
                    return value
                if isinstance(value, (dict, list)):
                    queue.append(value)
        elif isinstance(current, list):
            for item in current:
                if isinstance(item, (dict, list)):
                    queue.append(item)

    return None


def parse_bool(value: Any) -> bool:
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        return bool(value)
    if isinstance(value, str):
        return value.strip().lower() in {"1", "true", "yes", "on", "tls", "ssl"}
    return False


def parse_port(value: Any) -> Optional[int]:
    if value is None:
        return None
    try:
        return int(str(value).strip())
    except (TypeError, ValueError):
        return None


def parse_host_and_port(host_value: Optional[str], current_port: Optional[int]) -> Tuple[Optional[str], Optional[int], bool]:
    if not host_value:
        return None, current_port, False

    if "://" not in host_value:
        return host_value, current_port, False

    parsed = urllib.parse.urlparse(host_value)
    tls = parsed.scheme.lower() in {"mqtts", "ssl", "tls", "wss"}
    host = parsed.hostname
    port = parsed.port or current_port
    return host, port, tls


def resolve_topics(config: Dict[str, Any], device_id: str, fallback_prefix: Optional[str]) -> Dict[str, str]:
    topic_prefix = fallback_prefix or find_value(
        config,
        [
            "topicPrefix",
            "mqttTopicPrefix",
            "deviceTopicPrefix",
            "baseTopic",
            "topicBase",
            "prefix",
        ],
    )
    if isinstance(topic_prefix, str):
        topic_prefix = topic_prefix.replace("{deviceId}", device_id).replace("${deviceId}", device_id)
    if not topic_prefix:
        topic_prefix = f"/device/{device_id}"

    status_topic = find_value(config, ["statusTopic", "onlineTopic", "stateTopic"]) or f"{topic_prefix}/status"
    uplink_topic = find_value(config, ["uplinkTopic", "publishTopic", "reportTopic", "telemetryTopic"]) or f"{topic_prefix}/data"
    downlink_topic = find_value(config, ["downlinkTopic", "subscribeTopic", "commandTopic", "controlTopic"]) or f"{topic_prefix}/downlink"

    return {
        "status_topic": str(status_topic),
        "uplink_topic": str(uplink_topic),
        "downlink_topic": str(downlink_topic),
    }


def build_status_payload(device_id: str, online: bool) -> str:
    return json.dumps(
        {
            "deviceId": device_id,
            "online": online,
            "ts": utc_now_iso(),
        },
        ensure_ascii=True,
    )


def build_heartbeat_payload(device_id: str) -> str:
    if not hasattr(build_heartbeat_payload, "_counter"):
        build_heartbeat_payload._counter = 0
    build_heartbeat_payload._counter += 1
    is_fall = (build_heartbeat_payload._counter % 10 == 0)
    return json.dumps(
        {
            "device_id": device_id,
            "heart_rate_per_min": random.randint(60, 100),
            "breath_rate_per_min": random.randint(12, 20),
            "is_fall": is_fall,
            "is_person_present": True,
            "collectTime": int(time.time() * 1000),
        },
        ensure_ascii=True,
    )


def login_and_get_token(args: argparse.Namespace) -> Optional[str]:
    if args.token:
        return args.token
    if not args.login_phone or not args.login_password:
        return None

    login_res = api_request(
        api_origin=args.api_origin,
        mini_client_id=args.mini_client_id,
        mini_shared_secret=args.mini_shared_secret,
        path=args.login_path,
        method="POST",
        data={"phone": args.login_phone, "password": args.login_password},
    )
    if isinstance(login_res, dict):
        return login_res.get("token")
    return None


def fetch_backend_mqtt_config(args: argparse.Namespace, token: Optional[str]) -> Dict[str, Any]:
    if args.skip_backend or not args.mqtt_config_path:
        return {}

    result = api_request(
        api_origin=args.api_origin,
        mini_client_id=args.mini_client_id,
        mini_shared_secret=args.mini_shared_secret,
        path=args.mqtt_config_path,
        method="GET",
        params={"deviceId": args.device_id},
        token=token,
    )
    if isinstance(result, dict):
        return result
    return {}


def reason_code_to_int(reason_code: Any) -> int:
    if hasattr(reason_code, "value"):
        try:
            return int(reason_code.value)
        except (TypeError, ValueError):
            pass
    try:
        return int(reason_code)
    except (TypeError, ValueError):
        return -1


def main() -> None:
    parser = argparse.ArgumentParser(description="MQTT client with backend auth/sign support")

    parser.add_argument("--device-id", default=DEFAULT_DEVICE_ID, help="Device ID")
    parser.add_argument("--host", default=None, help="MQTT broker host, or mqtt:// / mqtts:// URL")
    parser.add_argument("--port", type=int, default=None, help="MQTT broker port")
    parser.add_argument("--mqtt-username", default=DEFAULT_MQTT_USERNAME, help="MQTT username")
    parser.add_argument("--mqtt-password", default=DEFAULT_MQTT_PASSWORD, help="MQTT password")
    parser.add_argument("--mqtt-client-id", default=None, help="MQTT client ID, default equals device-id")
    parser.add_argument("--tls", action="store_true", help="Enable TLS")

    parser.add_argument("--topic-prefix", default=None, help="Topic prefix, e.g. devices/DEV-MINI-001")
    parser.add_argument("--status-topic", default=None, help="Status topic override")
    parser.add_argument("--uplink-topic", default=None, help="Uplink topic override")
    parser.add_argument("--downlink-topic", default=None, help="Downlink topic override")

    parser.add_argument("--api-origin", default=DEFAULT_API_ORIGIN, help="Backend API origin")
    parser.add_argument("--mini-client-id", default=DEFAULT_MINI_CLIENT_ID, help="X-Mini-Client-Id")
    parser.add_argument("--mini-shared-secret", default=DEFAULT_MINI_SHARED_SECRET, help="Mini app shared secret")
    parser.add_argument("--login-path", default="/auth/login", help="Backend login path, no /api prefix")
    parser.add_argument("--mqtt-config-path", default="/mini/device/mqtt-config", help="MQTT config path, no /api prefix")
    parser.add_argument("--login-phone", default=None, help="Backend login phone")
    parser.add_argument("--login-password", default=None, help="Backend login password")
    parser.add_argument("--token", default=None, help="Backend bearer token")
    parser.add_argument("--skip-backend", action="store_true", help="Skip backend API calls")

    parser.add_argument("--keepalive", type=int, default=60, help="MQTT keepalive seconds")
    parser.add_argument("--connect-timeout", type=int, default=10, help="MQTT connect timeout seconds")
    parser.add_argument("--heartbeat", type=int, default=5, help="Heartbeat interval seconds, 0 disables")
    parser.add_argument("--qos", type=int, choices=[0, 1, 2], default=1, help="MQTT QoS")

    args = parser.parse_args()

    token = None
    backend_config: Dict[str, Any] = {}

    if not args.skip_backend:
        try:
            token = login_and_get_token(args)
            if token:
                print("Backend login success, token acquired.")
            backend_config = fetch_backend_mqtt_config(args, token)
            if backend_config:
                print("Fetched MQTT config from backend.")
        except Exception as exc:
            print(f"Backend request skipped due to error: {exc}")

    host = args.host or find_value(backend_config, ["host", "brokerHost", "server", "mqttHost", "url", "mqttUrl"])
    port = args.port or parse_port(find_value(backend_config, ["port", "brokerPort", "mqttPort"]))

    parsed_host, parsed_port, url_tls = parse_host_and_port(str(host) if host else None, port)
    if parsed_host:
        host = parsed_host
    if parsed_port:
        port = parsed_port

    tls_from_config = parse_bool(find_value(backend_config, ["tls", "ssl", "useTls", "useSSL"]))
    use_tls = bool(args.tls or url_tls or tls_from_config)

    if not host:
        print("MQTT host is required. Use --host, or ensure backend returns host in mqtt config.")
        sys.exit(1)
    if not port:
        port = 8883 if use_tls else 1883

    mqtt_username = args.mqtt_username or find_value(backend_config, ["username", "user", "mqttUsername", "mqttUser"])
    mqtt_password = args.mqtt_password or find_value(backend_config, ["password", "pass", "mqttPassword", "mqttPass"])
    mqtt_client_id = args.mqtt_client_id or find_value(backend_config, ["clientId", "mqttClientId"]) or args.device_id

    topics = resolve_topics(backend_config, device_id=args.device_id, fallback_prefix=args.topic_prefix)
    status_topic = args.status_topic or topics["status_topic"]
    uplink_topic = args.uplink_topic or topics["uplink_topic"]
    downlink_topic = args.downlink_topic or topics["downlink_topic"]

    try:
        client = mqtt.Client(
            callback_api_version=mqtt.CallbackAPIVersion.VERSION2,
            client_id=str(mqtt_client_id),
            protocol=mqtt.MQTTv311,
        )
    except TypeError:
        client = mqtt.Client(client_id=str(mqtt_client_id), protocol=mqtt.MQTTv311)

    if mqtt_username:
        client.username_pw_set(username=str(mqtt_username), password=str(mqtt_password or ""))

    if use_tls:
        client.tls_set()

    if hasattr(client, "connect_timeout"):
        client.connect_timeout = args.connect_timeout

    client.will_set(
        status_topic,
        payload=build_status_payload(args.device_id, False),
        qos=args.qos,
        retain=True,
    )

    def on_connect(client_obj: mqtt.Client, _userdata: Any, _flags: Any, reason_code: Any, _props: Any = None) -> None:
        code = reason_code_to_int(reason_code)
        if code == 0:
            print(f"Connected to MQTT broker {host}:{port}")
            client_obj.subscribe(downlink_topic, qos=args.qos)
            client_obj.publish(
                status_topic,
                payload=build_status_payload(args.device_id, True),
                qos=args.qos,
                retain=True,
            )
            print(f"Subscribed: {downlink_topic}")
        else:
            print(f"Connection failed, reason code={reason_code}")

    def on_disconnect(_client_obj: mqtt.Client, _userdata: Any, reason_code: Any, _props: Any = None) -> None:
        print(f"Disconnected, reason code={reason_code}")

    def on_message(_client_obj: mqtt.Client, _userdata: Any, msg: Any) -> None:
        print(f"Received [{msg.topic}]: {msg.payload.decode('utf-8', errors='replace')}")

    client.on_connect = on_connect
    client.on_disconnect = on_disconnect
    client.on_message = on_message

    print(f"Device: {args.device_id}")
    print(f"MQTT User: {mqtt_username}")
    print(f"Topics => status={status_topic}, uplink={uplink_topic}, downlink={downlink_topic}")

    try:
        client.connect(str(host), int(port), args.keepalive)
    except (TimeoutError, OSError) as exc:
        api_host = urllib.parse.urlparse(args.api_origin).hostname
        print(f"Failed to connect MQTT broker {host}:{port} -> {exc.__class__.__name__}: {exc}")
        print("Connection diagnosis: TCP connection cannot be established.")
        if api_host and str(host) == api_host:
            print("Current --host equals API server host. MQTT broker is usually a different host.")
        if int(port) == 1883:
            print("Try TLS port 8883 with --tls if broker requires SSL/TLS.")
        print("Check broker host, port, network ACL/security group/firewall, and protocol mode.")
        sys.exit(2)
    client.loop_start()

    sleep_seconds = max(1, args.heartbeat) if args.heartbeat != 0 else 1

    try:
        while True:
            if args.heartbeat > 0:
                client.publish(uplink_topic, payload=build_heartbeat_payload(args.device_id), qos=args.qos)
                print(f"Published heartbeat -> {uplink_topic}")
            time.sleep(sleep_seconds)
    except KeyboardInterrupt:
        print("Stopping client...")
    finally:
        client.publish(
            status_topic,
            payload=build_status_payload(args.device_id, False),
            qos=args.qos,
            retain=True,
        )
        client.loop_stop()
        client.disconnect()


if __name__ == "__main__":
    main()
