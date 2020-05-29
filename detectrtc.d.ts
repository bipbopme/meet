declare module "detectrtc" {
  const isMobileDevice: boolean;
  const isScreenCapturingSupported: boolean;

  const browser: {
    isSafari: boolean | undefined;
  };
}
