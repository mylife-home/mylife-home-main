'use strict';

exports['etc-hostname'] =
`test-host
`;

exports['etc-network-interfaces'] =
`auto lo
iface lo inet loopback

auto eth0
iface eth0 inet dhcp
\thostname test-host

`;

exports['etc-network-interfaces-hwaddr'] =
`auto lo
iface lo inet loopback

auto eth0
iface eth0 inet dhcp
\thwaddress ether 11:22:33:44:55:66
\thostname rpi-devel

`;

exports['etc-network-interfaces-wifi'] =
`auto lo
iface lo inet loopback

auto eth0
iface eth0 inet dhcp
\thostname rpi-devel

auto wlan0
iface wlan0 inet dhcp
\thostname rpi-devel
`;

exports['etc-wpa_supplicant-wpa_supplicant.conf'] =
`network={
  ssid="test-ssid"
  psk=123456789abcdef
}
`;

exports['etc-hosts'] =
`127.0.0.1\ttest-host.mti-team2.dyndns.org test-host localhost.localdomain localhost
`;

exports['etc-apk-world'] =
`alpine-base
chrony
openssh
test-package
`;