import YouTube from 'react-youtube';

// @deprecated
const YoutubeVideo = ({ videoId }) => {
  return (
    <YouTube
      videoId={videoId}
      // onReady={() => {}}
      opts={{
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: true,
          rel: '0',
        },
      }}
    />
  );
};

export default YoutubeVideo;
