# 2FA-OTP

## WTF?
This is a [cinnamon](https://en.wikipedia.org/wiki/Cinnamon_(desktop_environment)) applet.

## Installation
1) Install applet into `~/.local/share/cinnamon/applets/`:
```bash
cp -r files/2fa-otp@eftr ~/.local/share/cinnamon/applets
```

2) Modify file `~/.2fa-otp`. Example content:
```json
[
 {
  "name": "my.server.name",
  "secret" : "my-super-secret",
  "type": "totp"
 }
]
```

3) Add applet `OTP Client` in Applets window (right click on TaskPanel -> Applets)
