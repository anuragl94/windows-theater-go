import { useEffect, useRef } from 'react';
import VideoJS from '../components/video';

function NativePlayer(props) {
  const videoRef = useRef(null);

  useEffect(() => {
    const videoPath = props.metadata.seasons ? props.metadata.seasons[0][0].path : props.metadata.path;
    videoRef.current.src = `http://localhost:34116/video?path=${encodeURIComponent(videoPath)}`;
    videoRef.current.play();
  }, [props.metadata])

  return (
    <video ref={videoRef} controls></video>
  );
}

function Player(props) {
  const playerRef = useRef(null);
  const videoPath = props.metadata.seasons ? props.metadata.seasons[0][0].path : props.metadata.path;

  const videoJsOptions = {
    autoplay: true,
    controls: true,
    responsive: true,
    fluid: true,
    sources: [{
      src: `http://localhost:34116/video?path=${encodeURIComponent(videoPath)}`,
      type: 'video/mp4'
    }]
  };

  const handlePlayerReady = (player) => {
    playerRef.current = player;

    // You can handle player events here, for example:
    player.on('waiting', () => {
      VideoJS.log('player is waiting');
    });

    player.on('dispose', () => {
      VideoJS.log('player will dispose');
    });
  };

  return (
    <>
      <VideoJS options={videoJsOptions} onReady={handlePlayerReady} />
    </>
  );
}

export default Player;