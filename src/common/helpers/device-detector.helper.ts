enum MobileOS {
  Android = 'android',
  iOS = 'ios',
  Unknown = 'unknown',
  WindowsPhone = 'Windows Phone',
}

enum DesktopOS {
  Linux = 'linux',
  MacOS = 'mac_os',
  Unix = 'unix',
  Unknown = 'unknown',
  Windows = 'windows',
}

export class DeviceDetector {
  isMobileDevice(ua: string): boolean {
    const regexs = [
      /(Android)(.+)(Mobile)/i,
      /BlackBerry/i,
      /iPhone|iPod/i,
      /Opera Mini/i,
      /IEMobile/i,
    ];
    return regexs.some((b) => ua.match(b));
  }

  isTabletDevice(ua: string): boolean {
    const regex =
      /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/;
    return regex.test(ua.toLowerCase());
  }

  isDesktopDevice(ua): boolean {
    return !this.isMobileDevice(ua) && !this.isTabletDevice(ua);
  }

  /**
   * https://stackoverflow.com/a/21742107
   * Determine the mobile operating system.
   *
   * @returns {MobileOS}
   */
  getMobileOS(ua: string): MobileOS | undefined {
    if (!this.isMobileDevice(ua)) return undefined;
    // Windows Phone must come first because its UA also contains "Android"
    if (/windows phone/i.test(ua)) return MobileOS.WindowsPhone;
    else if (/android/i.test(ua)) return MobileOS.Android;

    // iOS detection from: http://stackoverflow.com/a/9039885/177710
    if (/iPad|iPhone|iPod/.test(ua)) return MobileOS.iOS;

    return MobileOS.Unknown;
  }

  getDesktopOS(ua: string): DesktopOS | undefined {
    if (!this.isDesktopDevice(ua)) return undefined;

    if (ua.indexOf('Win') !== -1) return DesktopOS.Windows;
    else if (ua.indexOf('Mac') !== -1) return DesktopOS.MacOS;
    else if (ua.indexOf('X11') !== -1) return DesktopOS.Unix;
    else if (ua.indexOf('Linux') !== -1) return DesktopOS.Linux;

    return DesktopOS.Unknown;
  }

  getDeviceOS(ua: string) {
    return this.getDesktopOS(ua) ?? this.getMobileOS(ua);
  }
}
