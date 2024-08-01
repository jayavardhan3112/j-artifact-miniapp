'use client'

import TopInfoSection from '@/components/TopInfoSection';
import IceCube from '@/Icons/IceCube';
import IceCubes from '@/Icons/IceCubes';
import Rocket from '@/Icons/Rocket';
import { lightning } from '@/images';
import { levelMinPoints, levelNames, useGameStore } from '@/utils/game-mechaincs';
import fluidPlayer from 'fluid-player';
import 'fluid-player/src/css/fluidplayer.css';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

interface GameProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

const videoOptions = (segmentsString: string, vastUrl: string) => ({
  layoutControls: {
    fillToContainer: true,
    playButtonShowing: true,
    primaryColor: '#AFB5D9',
    controlBar: {
      animated: false,
    },
  },
  vastOptions: {
    allowVPAID: true,
    adList: [
      {
        roll: 'preRoll' as 'preRoll',
        vastTag: vastUrl,
      },
    ],
  },
});

export default function Game({ currentView, setCurrentView }: GameProps) {
  const [id, setId] = useState<string | boolean>(true);
  const [hasAd, setHasAd] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<any>(null);
  const initialized = useRef(false);
  const ad_url = "https://pubads.g.doubleclick.net/gampad/ads?iu=/22988389496/ca-video-pub-2152499810871674-tag/social_bots&description_url=https%3A%2F%2Fapp.relicdao.com&tfcd=0&npa=0&sz=640x480&max_ad_duration=30000&gdfp_req=1&unviewed_position_start=1&output=vast&env=vp&impl=s&correlator="

  const initPlayer = useCallback((vastUrl: string) => {
    if (id && videoRef.current) {
      playerRef.current = fluidPlayer(videoRef.current, videoOptions('0', vastUrl));
      playerRef.current.on('ended', async () => {
        try {
          console.log("ended")
        } catch (error) {
          console.error('Error during API call:', error);
        }
        playerRef.current?.destroy();
      });
    }
  }, [id]);

  useEffect(() => {
    if (id && !initialized.current) {
      initialized.current = true;
      fetch(ad_url)
      .then((response) => response.text())
      .then((vastXml) => {
        setHasAd(true);
        const encodedVastContent = encodeURIComponent(vastXml);
        const vastUrl = 'data:application/xml,' + encodedVastContent;
        initPlayer(vastUrl);
      })
        .catch((error) => {
          console.error('Error fetching or processing ad:', error);
          setHasAd(false);
        });
    }
  }, [id, initPlayer]);
  

  const handleViewChange = (view: string) => {
    console.log('Attempting to change view to:', view);
    if (typeof setCurrentView === 'function') {
      try {
        setCurrentView(view);
        console.log('View change successful');
      } catch (error) {
        console.error('Error occurred while changing view:', error);
      }
    } else {
      console.error('setCurrentView is not a function:', setCurrentView);
    }
  };

  const [clicks, setClicks] = useState<{ id: number, x: number, y: number }[]>([]);

  const {
    points,
    pointsBalance,
    pointsPerClick,
    energy,
    maxEnergy,
    gameLevelIndex,
    clickTriggered,
    updateLastClickTimestamp,
  } = useGameStore();

  const calculateTimeLeft = (targetHour: number) => {
    const now = new Date();
    const target = new Date(now);
    target.setUTCHours(targetHour, 0, 0, 0);

    if (now.getUTCHours() >= targetHour) {
      target.setUTCDate(target.getUTCDate() + 1);
    }

    const diff = target.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    const paddedHours = hours.toString().padStart(2, '0');
    const paddedMinutes = minutes.toString().padStart(2, '0');

    return `${paddedHours}:${paddedMinutes}`;
  };

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    card.style.transform = `perspective(1000px) rotateX(${-y / 10}deg) rotateY(${x / 10}deg)`;
    setTimeout(() => {
      card.style.transform = '';
    }, 100);
    updateLastClickTimestamp();
    clickTriggered();
    setClicks([...clicks, { id: Date.now(), x: e.pageX, y: e.pageY }]);
  };

  const handleAnimationEnd = (id: number) => {
    setClicks((prevClicks) => prevClicks.filter(click => click.id !== id));
  };

  const calculateProgress = () => {
    if (gameLevelIndex >= levelNames.length - 1) {
      return 100;
    }
    const currentLevelMin = levelMinPoints[gameLevelIndex];
    const nextLevelMin = levelMinPoints[gameLevelIndex + 1];
    const progress = ((points - currentLevelMin) / (nextLevelMin - currentLevelMin)) * 100;
    return Math.min(progress, 100);
  };

  return (
    <div className="bg-black flex justify-center">
      <div className="w-full bg-black text-white h-screen font-bold flex flex-col max-w-xl">
        <TopInfoSection />

        <div className="flex-grow mt-4 bg-[#f3ba2f] rounded-t-[48px] relative top-glow z-0">
          <div className="absolute top-[2px] left-0 right-0 bottom-0 bg-[#1d2025] rounded-t-[46px]">

            <div className="px-4 mt-4 flex justify-center">
              <div className="px-4 py-2 flex items-center space-x-2">
                <IceCubes className="w-12 h-12 mx-auto" />
                <p className="text-4xl text-white" suppressHydrationWarning >{pointsBalance.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex justify-center gap-2">
              <p>{levelNames[gameLevelIndex]}</p>
              <p className="text-[#95908a]" >&#8226;</p>
              <p>{gameLevelIndex + 1} <span className="text-[#95908a]">/ {levelNames.length}</span></p>
            </div>
            <div className="ad-container">
              <video ref={videoRef} className="video">
                <source src="https://storage.googleapis.com/ad-serve-assets-0/1%20second%20black%20screen%20video.mp4" type="video/mp4" />
              </video>
            </div>
            {/* <div className="px-4 mt-4 flex justify-center">
              <div
                className="w-80 h-80 p-4 rounded-full circle-outer"
                onClick={handleCardClick}
              >
                <div className="w-full h-full rounded-full circle-inner overflow-hidden relative">
                  <Image
                    src={mainCharacter}
                    alt="Main Character"
                    fill
                    style={{
                      objectFit: 'cover',
                      objectPosition: 'center',
                      transform: 'scale(1.05) translateY(10%)'
                    }}
                  />
                </div>
              </div>
            </div> */}
            <div className="flex justify-between px-4 mt-4">
              <p className="flex justify-center items-center gap-1"><Image src={lightning} alt="Exchange" width={40} height={40} /><span className="flex flex-col"><span className="text-xl font-bold">{energy}</span><span className="text-base font-medium">/ {maxEnergy}</span></span></p>
              <button onClick={() => handleViewChange("boost")} className="flex justify-center items-center gap-1"><Rocket size={40} /><span className="text-xl">Boost</span></button>
            </div>

            <div className="w-full px-4 text-sm mt-2">
              <div className="flex items-center mt-1 border-2 border-[#43433b] rounded-full">
                <div className="w-full h-3 bg-[#43433b]/[0.6] rounded-full">
                  <div className="progress-gradient h-3 rounded-full" style={{ width: `${calculateProgress()}%` }}></div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {clicks.map((click) => (
        <div
          key={click.id}
          className="absolute text-5xl font-bold opacity-0 text-white pointer-events-none flex justify-center"
          style={{
            top: `${click.y - 42}px`,
            left: `${click.x - 28}px`,
            animation: `float 1s ease-out`
          }}
          onAnimationEnd={() => handleAnimationEnd(click.id)}
        >
          {pointsPerClick}<IceCube className="w-12 h-12 mx-auto" />
        </div>
      ))}
    </div>
  )
}