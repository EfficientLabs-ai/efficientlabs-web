import { Composition } from "remotion";
import { BrandTitle } from "./compositions/BrandTitle";

/**
 * The composition catalog. Each <Composition> is a parameterized video template — drive it with
 * defaultProps here, or override props per render (--props) / per <Player> mount in the site.
 * Brand tokens are mirrored from app/globals.css (void/signal/quantum) so rendered media matches
 * the live site exactly.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="BrandTitle"
      component={BrandTitle}
      durationInFrames={180}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        kicker: "GOVERNED INTELLIGENCE INFRASTRUCTURE",
        title: "Own your intelligence.",
        accent: "Govern it. Prove it.",
        sub: "Sovereign AI infrastructure — owned, governed, and verifiable.",
      }}
    />
  );
};
