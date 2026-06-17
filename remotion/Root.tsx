import { Composition } from 'remotion';
import DashboardVideo from './Video';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="DashboardVideo"
        component={DashboardVideo}
        durationInFrames={1200}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
