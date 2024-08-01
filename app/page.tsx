'use client'

import WebApp from '@twa-dev/sdk';
import { useEffect, useState } from 'react';

interface UserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code: string;
  is_premium?: boolean;
}

export default function Home() {
  const [userData, setUserData] = useState<UserData | null>(null)

  useEffect(() => {
    if (WebApp.initDataUnsafe.user) {
      setUserData(WebApp.initDataUnsafe.user as UserData)
    }
  }, [])
  return (
    <div className="bg-[#1d2025] flex justify-center items-center h-screen">
      <div className="w-full max-w-xl text-white flex flex-col items-center">
        <main className="p-4">
          {userData ? (
            <>
              <h1 className="text-2xl font-bold mb-4">User Data</h1>
              <ul>
                <li>ID: {userData.id}</li>
                <li>First Name: {userData.first_name}</li>
                <li>Last Name: {userData.last_name || 'N/A'}</li>
                <li>Username: {userData.username || 'N/A'}</li>
                <li>Language Code: {userData.language_code}</li>
                <li>Is Premium: {userData.is_premium ? 'Yes' : 'No'}</li>
              </ul>
            </>
          ) : (
            <div>Loading...</div>
          )}
        </main>
        {/* <div className="w-64 h-64 rounded-full circle-outer p-2 mb-8">
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
        </div> */}
        
        {/* <h1 className="text-3xl font-bold mb-4">Welcome to TonIce</h1>
        
        <p className="text-xl mb-6">The game is on the <Link href="/clicker" className="underline">Clicker</Link> page.</p>
        
        <div className="flex items-center space-x-2">
          <IceCube className="w-8 h-8 animate-pulse" />
          <IceCube className="w-8 h-8 animate-pulse delay-100" />
          <IceCube className="w-8 h-8 animate-pulse delay-200" />
        </div> */}
      </div>
    </div>
  );
}
