import argparse
import json
import sys
import time
from datetime import datetime, timezone

try:
    import paho.mqtt.client as mqtt
except ImportError:
    print("Missing dependency: paho-mqtt")
    print("Install it with: pip install paho-mqtt")
    sys.exit(1)


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def build_payload(device_id: str, online: bool) -> str:
    return json.dumps(
        {
            "device_id": device_id,
            "online": online,
            "ts": utc_now_iso(),
        },
        ensure_ascii=True,
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="MQTT client for device01")
    parser.add_argument("--host", default="127.0.0.1", help="MQTT broker host")
    parser.add_argument("--port", type=int, default=1883, help="MQTT broker port")
    parser.add_argument("--device-id", default="device01", help="Device ID")
    parser.add_argument("--username", default=None, help="MQTT username")
    parser.add_argument("--password", default=None, help="MQTT password")
    parser.add_argument("--keepalive", type=int, default=60, help="MQTT keepalive seconds")
    parser.add_argument("--heartbeat", type=int, default=30, help="Heartbeat interval seconds")
    parser.add_argument("--qos", type=int, choices=[0, 1, 2], default=1, help="MQTT QoS")
    args = parser.parse_args()

    topic_prefix = f"devices/{args.device_id}"
    online_topic = f"{topic_prefix}/status"
    uplink_topic = f"{topic_prefix}/uplink"
    downlink_topic = f"{topic_prefix}/downlink"

    client = mqtt.Client(client_id=args.device_id, protocol=mqtt.MQTTv311)

    if args.username:
        client.username_pw_set(args.username, args.password)

    client.will_set(online_topic, payload=build_payload(args.device_id, False), qos=args.qos, retain=True)

    def on_connect(client_obj, _userdata, _flags, reason_code):
        if reason_code == 0:
            print(f"Connected to MQTT broker {args.host}:{args.port}")
            client_obj.subscribe(downlink_topic, qos=args.qos)
            client_obj.publish(
                online_topic,
                payload=build_payload(args.device_id, True),
                qos=args.qos,
                retain=True,
            )
            print(f"Subscribed: {downlink_topic}")
        else:
            print(f"Connection failed, reason code={reason_code}")

    def on_disconnect(_client_obj, _userdata, reason_code):
        print(f"Disconnected, reason code={reason_code}")

    def on_message(_client_obj, _userdata, msg):
        print(f"Received [{msg.topic}]: {msg.payload.decode('utf-8', errors='replace')}")

    client.on_connect = on_connect
    client.on_disconnect = on_disconnect
    client.on_message = on_message

    client.connect(args.host, args.port, args.keepalive)
    client.loop_start()

    try:
        while True:
            heartbeat = json.dumps(
                {
                    "device_id": args.device_id,
                    "type": "heartbeat",
                    "ts": utc_now_iso(),
                },
                ensure_ascii=True,
            )
            client.publish(uplink_topic, payload=heartbeat, qos=args.qos)
            print(f"Published heartbeat -> {uplink_topic}")
            time.sleep(args.heartbeat)
    except KeyboardInterrupt:
        print("Stopping client...")
    finally:
        client.publish(
            online_topic,
            payload=build_payload(args.device_id, False),
            qos=args.qos,
            retain=True,
        )
        client.loop_stop()
        client.disconnect()


if __name__ == "__main__":
    main()
