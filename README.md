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



# Denon commands available

Discovered with tcpdump that Denon iPhone app uses HTTP requests instead of Telnet connection. There is no known documentation about this API from Denon

ssh root@192.168.1.1 tcpdump -i br-lan dst 192.168.1.168 -U -s0 -w - > tdump


http://192.168.1.168/goform/formNetAudio_StatusXml.xml

http://192.168.1.168//goform/formiPhoneAppDirect.xml?MVUP

http://192.168.1.168/goform/formiPhoneAppPower.xml?1+PowerStandby

http://192.168.1.168/goform/formiPhoneAppFavorite_Call.xml?01

http://192.168.1.168/goform/formiPhoneAppControlJudge.xml

http://192.168.1.168/goform/Deviceinfo.xml

http://192.168.1.168/NetAudio/art.asp-jpg?1630075616

http://192.168.1.168:8080/description.xml

http://192.168.1.168:8080/RenderingControl/desc.xml

http://192.168.1.168:8080/AVTransport/desc.xml




http://192.168.1.168/goform/AppCommand.xml

  <?xml version="1.0" encoding="utf-8"?>
  <tx>
   <cmd id="1">GetAllZonePowerStatus</cmd>
   <cmd id="1">GetVolumeLevel</cmd>
   <cmd id="1">GetMuteStatus</cmd>
   <cmd id="1">GetSourceStatus</cmd>
   <cmd id="1">GetNetAudioStatus</cmd>
   <cmd id="1">GetZoneName</cmd>
   <cmd id="1">GetRenameSource</cmd>
   <cmd id="1">GetDeletedSource</cmd>
   <cmd id="1">GetDeletedNetworkSource</cmd>
   <cmd id="1">GetSystemFavoriteList</cmd>
  </tx>
