# Denon CEOL Piccolo web interface

This is a Denon CEOL Piccolo remote http API and minimalistic web interface running on NodeJS. Note that the functionality is relevant only to my own needs, but the interface can be easily extended.

# Installation (Linux)

1. Install git, nodejs, npm
2. Clone this repository
3. Install nodejs dependencies: `npm install`
4. Install forever globally: `sudo npm install forever -g`
5. Install forever linux service `sudo npm install -g forever-service`
6. Execute application: `forever start index.js` or provision as a service: `sudo forever-service install denon --script index.js`
7. View interface on http://host:port