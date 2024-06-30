#!/usr/bin/env python3
"""
Print to console your machine IP in your LAN
Inspired by https://stackoverflow.com/a/166589
"""

import socket

GOOGLE_DNS_SERVER_PUBLIC_IP = "8.8.8.8"
UDP_PORT = 1  # sends no traffic, https://stackoverflow.com/a/1267524

IP = str


class NoInternet(Exception): ...


def get_current_device_ip_in_lan(public_ip: str, port: int) -> IP:
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

    try:
        s.connect((public_ip, port))
    except OSError as error:
        raise NoInternet(error)

    local_ip: IP = s.getsockname()[0]
    s.close()

    return local_ip


if __name__ == "__main__":
    try:
        ip = get_current_device_ip_in_lan(
            public_ip=GOOGLE_DNS_SERVER_PUBLIC_IP, port=UDP_PORT
        )
    except NoInternet as error:
        exit(f"it seems there is no internet, reason: {error}")
    print(ip)
