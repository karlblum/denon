# Denon CEOL Piccolo web interface

This is a Denon CEOL Piccolo remote http API and minimalistic web interface running on NodeJS. Note that the functionality is relevant only to my own needs, but the interface can be easily extended.

# Installation (Linux)

1. Install git, nodejs, npm
2. Clone this repository
3. Install nodejs dependencies: `npm install`
4. Install forever globally: `sudo npm install forever -g`
5. Install forever linux service `sudo npm install -g forever-service`
6. Execute application: `forever start index.js` or provision as a service: `sudo forever-service install denon --script index.js`
7. Wiew interface on http://host:port

# Installation (Windows)

Same as above, but instead of forever start.vbs should be added to Startup folder in Windows.

# Installation (OpenWrt)

1. Extend your router storage by adding additional USB memory stick: https://linuxconfig.org/how-to-extend-lede-openwrt-system-storage-with-an-usb-device
2. opkg update
3. opkg install git-http
4. opkg install node node-npm
5. git clone https://github.com/karlblum/denon.git
6. npm install
7. npm install -g forever
8. forever start denon.js
