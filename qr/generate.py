import sys

import pyqrcode

arguments = sys.argv
assert len(arguments) == 2, "Must pass only one argument"
ip = arguments[1]

qr_content = f'https://{ip}:3000/fitness-tracker'

qr = pyqrcode.create(qr_content)
qr_as_str = qr.terminal(quiet_zone=1)

print(f"Scan the QR code bellow to access the app\n{qr_as_str}\n{qr_content}")
