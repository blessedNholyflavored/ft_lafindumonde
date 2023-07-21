import React, { useState, useRef, useEffect } from 'react';

export const PongGame = () => {

    const [player1, setPlayer1] = useState(300);
    const [player2, setPlayer2] = useState(300);
 //   const [ball, setBall] = useState({ x: 900, y: 300 });
  //  const [ballDir, setBallDir] = useState({ x: 1, y: -1 });
    const [keyCode, setKeyCode] = useState('');
    const gameAreaRef = useRef<HTMLDivElement>(null);    
    const mapy = 600;
    const mapx = 1800; 
    const ballSpeed = 12;
    const [ player1Point, setPoint1 ] = useState(0);
    const [ player2Point, setPoint2 ] = useState(0);
    const [ player1tsc, setPoint1tsc ] = useState(0);
    const [ player2tsc, setPoint2tsc ] = useState(0);
    const [ball, setBall] = useState<{ x: number; y: number }>({ x: 900, y: 300 });
    const [ballDir, setBallDir] = useState<{ x: number; y: number }>({ x: -1, y: 0 });
    const [end, setEnd] = useState<boolean>(false);

    const playerMove = (e: React.KeyboardEvent<HTMLDivElement>) => {


          if (end)
            return;
          setKeyCode(e.key);
          const key = e.keyCode;
          const speed = 30;
      
          if (key === 87 && player1 > 10)
          {
            setPlayer1(player1 - speed);
          }
          else if (key === 83 && player1 < mapy - 90)
          {
            setPlayer1(player1 + speed);
          }
          else if (key === 38 && player2 > 10)
          {
            setPlayer2(player2 - speed);
          }
          else if (key === 40 && player2 < mapy - 90)
          {
            setPlayer2(player2 + speed);
          }
      };

      
      useEffect(() => {

        const interval = setInterval(() => {
          setBall((prevBallPos: { x: number; y: number }) => ({
            x: prevBallPos.x + ballDir.x * ballSpeed,
            y: prevBallPos.y + ballDir.y * ballSpeed,
          }));
        }, 1000 / 60);
        return () => clearInterval(interval);
      }, [ballDir]);

      useEffect(() => {
        
        if (end)
          return;
          if (ball.y >= mapy - 8 || ball.y <= 0)
          {
            setBallDir((prevBallDir: { x: number; y: number }) => ({ ...prevBallDir, y: -prevBallDir.y }));
          }
          if (ball.x >= mapx - 8 - 10 || ball.x <= 10)
          {
            if ((ball.x > mapx / 2 && ball.y + 8 >= player2 && ball.y <= player2 + 90) || (ball.x < mapx / 2 && ball.y + 8 >= player1 && ball.y <= player1 + 90))
            {
              if (ball.y <= player2 - 20 || ball.y <= player1 - 20)
                setBallDir((prevBallDir: { x: number; y: number }) => ({ ...prevBallDir, y: -prevBallDir.y - 0.15}));
              if (ball.y <= player2 + 20 || ball.y <= player1 + 20)
                setBallDir((prevBallDir: { x: number; y: number }) => ({ ...prevBallDir, y: -prevBallDir.y + 0.30}));
              setBallDir((prevBallDir: { x: number; y: number }) => ({ ...prevBallDir, x: -prevBallDir.x}));
            }
          }
          if (ball.x < 0)
          {
            ball.x = 900;
            ball.y = 300;
            setBall((prevBallPos: { x: number; y: number }) => ({
              x: 900,
              y: 300,
            }));
            setPoint2((prevScore: number) => prevScore + 1);
            setPoint2tsc((prevScore: number) => prevScore + 1);
          }
          if (ball.x >= mapx)
          {
            ball.x = 900;
            ball.y = 300;
            setBall((prevBallPos: { x: number; y: number }) => ({
              x: 900,
              y: 300,
            }));
            setPoint1((prevScore: number) => prevScore + 1);
            setPoint1tsc((prevScore: number) => prevScore + 1);
          }
        }, [ball]);

  const [usernames, setUsernames] = useState([]);

        useEffect(() => {
          const fetchUsernames = async () => {
            try {
              const response = await (await fetch("http://localhost:3000/users")).json();
              const usernamesArray = response.map((user: { username: any; }) => user.username);
              setUsernames(usernamesArray);
            } catch (error) {
              console.error('Error fetching usernames:', error);
            }
          };  
          fetchUsernames();
        }, []);

        useEffect(() => {
    if (gameAreaRef.current) {
      gameAreaRef.current.focus();
    }
  }, []);

  const restartGame = () => {
    setEnd(false);
    setPlayer1(300);
    setPlayer2(300);
    setPoint1tsc(0);
    setPoint2tsc(0);
    setBallDir((prevBallDir: { x: number; y: number }) => ({ ...prevBallDir, x: 1}));
    setBallDir((prevBallDir: { x: number; y: number }) => ({ ...prevBallDir, y: 0}));
  };


  useEffect(() => {

    if (player1Point >= 5 || player2Point >= 5) {
      setEnd(true);
      setBallDir((prevBallDir: { x: number; y: number }) => ({ ...prevBallDir, x: 0}));
      setBallDir((prevBallDir: { x: number; y: number }) => ({ ...prevBallDir, y: 0}));
      setPoint1(0);
      setPoint2(0);

    }
  }, [player1Point, player2Point, end, ballDir]);


      return (
        
        <div>


          {usernames.map((username, index) => (
            <p key={index}>hello {username}</p>
            ))}
                  <h1>KeyCode: {keyCode}</h1>
                  <h1>{ usernames[0] }: {player1}</h1>
                  <h1>{ usernames[1] }: {player2}</h1>
          <div style={{ textAlign: 'center', fontSize: '24px', marginBottom: '10px' }}>
            Score - { usernames[0] } { player1tsc } | { player2tsc } { usernames[1] }
            
          </div>
          
          <div
            ref={gameAreaRef}
            tabIndex={0}
            onKeyDown={playerMove}
            style={{
              width: mapx,
              height: mapy,
              border: '7px solid black',
              position: 'relative',
            }}
          >
            { end && (
            <div>
              <h1>Fin de partie !</h1>
              Score - { usernames[0] } { player1tsc } | { player2tsc } { usernames[1] }
              { player1tsc >= 5 && (
                <p>{ usernames[0] } remporte la partie</p>
              )}
              { player2tsc >= 5 && (
                <p>{ usernames[1] } remporte la partie</p>
              )}
              <button onClick={restartGame}>Recommencer</button>
              </div>)}
            
            {!end && (
              <>
            <div id="moncercle" style={{ top: ball.y, left: ball.x,}}></div>
            <div
              style={{
                position: 'absolute',
                width: 10,
                height: 90,
                backgroundColor: 'blue',
                top: player1,
                left: 0,
              }}
            ></div>
            <div
              style={{
                position: 'absolute',
                width: 10,
                height: 90,
                backgroundColor: 'red',
                top: player2,
                right: 0,
              }}
            ></div>
            </>
            )}
          </div>
        </div>
      );
};