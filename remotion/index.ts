// Remotion entry — registers the composition catalog for the CLI renderer + the in-app Player.
// Render:  npx remotion render remotion/index.ts <CompId> out/<file>.mp4
// Studio:  npx remotion studio remotion/index.ts
import { registerRoot } from "remotion";
import { RemotionRoot } from "./Root";

registerRoot(RemotionRoot);
