// Remotion render config. Uses the project's bundled Chromium (the one already on the box) so no
// extra browser download is needed. See: remotion.dev/docs/config
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setConcurrency(2);
Config.setChromiumOpenGlRenderer("angle");
