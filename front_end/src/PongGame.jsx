import React, { useState, useRef, useEffect } from 'react';

export const PongGame = () => {

    const [player1, setPlayer1] = useState(300);
    const [player2, setPlayer2] = useState(300);
    const [ballStart, setBallStart] = useState(250);
    const [ball, setBall] = useState({ x: 900, y: 300 });
    const [ballDir, setBallDir] = useState({ x: 1, y: -1 });
    const [keyCode, setKeyCode] = useState('');
    const gameAreaRef = useRef(null);
    const mapy = 600;
    const mapx = 1800;
    const ballSpeed = 7;
    const [ player1Point, setPoint1 ] = useState(0);
    const [ player2Point, setPoint2 ] = useState(0);

    const playerMove = (e) => {


            setKeyCode(e.keyCode);
            const { keyCode } = e;
            const speed = 20;
        
            if (keyCode === 87 && player1 > 0)
            {
              setPlayer1(player1 - speed);
            }
            else if (keyCode === 83 && player1 < mapy - 90)
            {
              setPlayer1(player1 + speed);
            }
            else if (keyCode === 38 && player2 > 0)
            {
              setPlayer2(player2 - speed);
            }
            else if (keyCode === 40 && player2 < mapy - 90)
            {
              setPlayer2(player2 + speed);
            }
      };

      
      useEffect(() => {

        const interval = setInterval(() => {
          setBall((prevBallPos) => ({
            x: prevBallPos.x + ballDir.x * ballSpeed,
            y: prevBallPos.y + ballDir.y * ballSpeed,
          }));
        }, 1000 / 60);
        return () => clearInterval(interval);
      }, [ballDir]);

      useEffect(() => {
        

          if (ball.y >= mapy - 8 || ball.y <= 0)
          {
            setBallDir((prevBallDir) => ({ ...prevBallDir, y: -prevBallDir.y }));
          }
          if (ball.x >= mapx - 8 - 10 || ball.x <= 10)
          {
            if ((ball.x > mapx / 2 && ball.y + 8 >= player2 && ball.y <= player2 + 90) || (ball.x < mapx / 2 && ball.y + 8 >= player1 && ball.y <= player1 + 90))
            {
              setBallDir((prevBallDir) => ({ ...prevBallDir, x: -prevBallDir.x }));
            }
          }
          if (ball.x <= 0)
          {
            ball.x = 900;
            ball.y = 300;
            setPoint2((prevScore) => prevScore + 1);
          }
          if (ball.x >= mapx)
          {
            ball.x = 900;
            ball.y = 300;
            setPoint1((prevScore) => prevScore + 1);

          }
        }, [ball]);
        

        useEffect(() => {
    if (gameAreaRef.current) {
      gameAreaRef.current.focus();
    }
  }, []);


      return (
        <div>
                  <h1>KeyCode: {keyCode}</h1>
          <div style={{ textAlign: 'center', fontSize: '24px', marginBottom: '10px' }}>
            Score - Joueur 1: { player1Point } | Joueur 2: { player2Point }
          </div>
          <div
            ref={gameAreaRef}
            tabIndex="0"
            onKeyDown={playerMove}
            style={{
              width: mapx,
              height: mapy,
              border: '7px solid black',
              position: 'relative',
            }}
          >
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
          </div>
        </div>
      );
};