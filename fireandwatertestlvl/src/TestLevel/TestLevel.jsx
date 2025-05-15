
import React, { useEffect, useRef, useState } from 'react';
import './Level.css'

export const TestLevel = () => {
    const canvasRef = useRef(null);
    const [keys, setKeys] = useState({});
    const [timer, setTimer] = useState(0);
    const [levelDone, setLevelDone] = useState(false);
    const [stars, setStars] = useState(0);

    const gravity = 0.4;
    const jumpForce = -10;
    const speed = 5;
    

    const platforms = [
        
        { x: 0, y: 680, width: 410, height: 20 },
        { x: 410, y: 690, width: 940, height: 10 },
        { x: 400, y: 690, height: 10, holeType: 'fire' },
        { x: 600, y: 690, height: 10, holeType: 'water' },
        { x: 800, y: 690, height: 10, holeType: 'fire' },
        { x: 400, y: 350, width: 200, height: 20 },
        { x: 800, y: 300, width: 150, height: 20 },
        { x: 450, y: 200, width: 200, height: 20 },
        { x: 300, y: 600, width: 150, height: 20 },
        { x: 500, y: 500, width: 150, height: 20 },
        { x: 700, y: 450, width: 200, height: 20 }
    ];

    const plat = platforms[0];
    const groundY = plat.y + plat.height;
    // const groundX = plat.x + plat.width;

    

    useEffect(() => {

        const formatTime = (time) => {
            const minutes = Math.floor(time / 60);
            const seconds = time % 60;
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        };
        
        let timerInterval;

        if (!levelDone) {
            timerInterval = setInterval(() => {
                
                
                setTimer((prev) => prev + 1);
                

            }, 1000);
            
        }

        return () => clearInterval(timerInterval);
    }, [levelDone]);

    useEffect(() => {
        if (levelDone) {
            const timeout = setTimeout(() => {
                showModal();
            }, 1000);
            return () => clearTimeout(timeout);
        }
    }, [levelDone])

    const calculateStars = (time) => {
        if (time <= 20) return 3;
        if (time <= 30) return 2;
        if (time < 40) return 1;
        return 0;
    };

    const showModal = () => {
        const earnedStars = calculateStars(timer);
        setStars(earnedStars);
    };

    const resetGame = () => {
        setLevelDone(false);
        setTimer(0);
        setStars(0);
        firePlayer.current.x = 100;
        firePlayer.current.y = 100;
        waterPlayer.current.x = 200;
        waterPlayer.current.y = 200;

    }



    
    

    const firePlayer = useRef({
        x: 100,
        y: 100,
        width: 40,
        height: 40,
        velY: 0,
        onGround: false,
        color: 'red',
        controls: { left: 'a', right: 'd', jump: 'w' }
    });

    const waterPlayer = useRef({
        x: 200,
        y: 100,
        width: 40,
        height: 40,
        velY: 0,
        onGround: false,
        color: 'blue',
        controls: { left: 'ArrowLeft', right: 'ArrowRight', jump: 'ArrowUp' }
    });

    const finishZones = [
        { x: 550, y: 130, width: 40, height: 70, color: 'red', player: 'fire' },
        { x: 600, y: 130, width: 40, height: 70, color: 'blue', player: 'water' }
    ];

    const hasReachedFinish = (player, zone) => {
        return (
            player.x < zone.x + zone.width &&
            player.x + player.width > zone.x &&
            player.y < zone.y + zone.height &&
            player.y + player.height > zone.y
        );
    };

    const handleMovement = (player) => {

        


        const controls = player.controls;
        let prevY = player.y;
        let prevX = player.x;
    
        // Горизонтальний рух
        if (keys[controls.left]) player.x -= speed;
        if (keys[controls.right]) player.x += speed;
    
        // Стрибок
        if (keys[controls.jump] && player.onGround) {
            player.velY = jumpForce;
            player.onGround = false;
        }
    
        // Гравітація
        player.velY += gravity;
        player.y += player.velY;
    
        // Скидаємо прапор onGround, оновимо якщо знайдемо платформу
        player.onGround = false;
    
        // Колізія з платформами згори
        platforms.forEach((plat) => {

 
            const wasAbove = prevY + player.height <= plat.y;
            const wasBelow = prevY >= plat.y + plat.height; // Check if the player was below the platform
            const isFalling = player.velY >= 0;
            const isJumping = player.velY < 0; // Check if the player is jumping
            const nowOnTop = player.y + player.height >= plat.y &&
                             player.y + player.height <= plat.y + plat.height;
            const nowBelow = player.y <= plat.y + plat.height && player.y >= plat.y; // Check if the player is below the platform
            const isWithinX = player.x + player.width > plat.x && player.x < plat.x + plat.width;
            const wasLeft = prevX + player.width <= plat.x;
            const wasRight = prevX >= plat.x + plat.width;
            const nowLeft = player.x <= plat.x + plat.width && player.x >= plat.x;
            const nowRight = player.x + player.width >= plat.x && player.x + player.width <= plat.x + plat.width;

            if (wasLeft && nowLeft && isFalling && isWithinX) {
                player.x = plat.x - player.width;
                player.velY = 0;
                player.onGround = true;
            }

            if (wasRight && nowRight && isFalling && isWithinX) {
                player.x = plat.x + plat.width;
                player.velY = 0;
                player.onGround = true;
            }
            // Prevent jumping through platforms from below
            if (wasBelow && isJumping && nowBelow && isWithinX) {
                player.y = plat.y + plat.height; // Push the player below the platform
                player.velY = 0; // Stop upward movement
            }
        
            // Handle landing on top of platforms
            if (wasAbove && isFalling && nowOnTop && isWithinX) {
                player.y = plat.y - player.height;
                player.velY = 0;
                player.onGround = true;
            }

            


            if(keys[controls.left] || keys[controls.right]) {

                console.log(player, 'player')
                console.log(plat, 'plat')
                console.log(wasAbove, 'wasAbove');
                console.log(wasBelow, 'wasBelow');
                console.log(isFalling, 'isFalling');
                console.log(isJumping, 'isJumping');
                console.log(nowOnTop, 'nowOnTop');
                console.log(isWithinX, 'isWithinX');
            console.log( 'a:  ', 'x:',plat.x, 'y:',plat.y, '| b:  ', 'x:',plat.x, 'y:',plat.y - plat.height , '| c: ', 'x:',plat.width, 'y:',plat.y - plat.height, '| d: ', 'x:',plat.width, 'y:',plat.y);
            console.log('players a: ', 'x:',player.x, 'y:',player.y, '| players b: ', 'x:',player.x, 'y:',player.y - player.height , '| players c: ', 'x:',player.width, 'y:',player.y - player.height, '| players d: ', 'x:',player.width, 'y:',player.y);
            


            asdasd
            }

            

           
            

            
        });
    
        // Колізія з землею
        if (player.y + player.height >= groundY) {
            player.y = groundY - player.height;
            player.velY = 0;
            player.onGround = true;
        }
    };

    useEffect(() => {
        const handleKeyDown = (e) => setKeys((k) => ({ ...k, [e.key]: true }));
        const handleKeyUp = (e) => setKeys((k) => ({ ...k, [e.key]: false }));

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        let animationFrameId;

        const loop = () => {
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            if (!ctx) {
                animationFrameId = requestAnimationFrame(loop);
                return;
            }

            handleMovement(firePlayer.current);
            handleMovement(waterPlayer.current);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // //Ground
            // ctx.fillStyle = 'gray';
            // ctx.fillRect(0, groundY, groundX)

            // Platforms
            ctx.fillStyle = 'gray';
            platforms.forEach((plat) => {
                ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
            });
            // ctx.fillRect(100, groundY, canvas.width, 20);

            

            // Players
            [firePlayer.current, waterPlayer.current].forEach((p) => {
                ctx.fillStyle = p.color;
                ctx.fillRect(p.x, p.y, p.width, p.height);
            });

            // Finish zones
            finishZones.forEach((zone) => {
                ctx.fillStyle = zone.color;
                ctx.fillRect(zone.x, zone.y, zone.width, zone.height);
            });

            // Win condition
            const fireDone = hasReachedFinish(firePlayer.current, finishZones[0]);
            const waterDone = hasReachedFinish(waterPlayer.current, finishZones[1]);

            if (fireDone && waterDone && !levelDone) {
                // ctx.fillStyle = 'black';
                // ctx.font = '30px Arial';
                // ctx.fillText('LEVEL DONE!', 270, 100);

                setLevelDone(true)
            }

            animationFrameId = requestAnimationFrame(loop);
        };

        loop();

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            cancelAnimationFrame(animationFrameId);
        };
    }, [keys]);

    return (
        <div>
            <canvas
                ref={canvasRef}
                width={1300}
                height={700}
                style={{
                    border: '1px solid black',
                    display: 'block',
                    margin: '0 auto'}}/>

                    <p style={{position: 'absolute', top: '5px', left: '650px', fontSize: '20px'}}>Time: {timer}s</p>

                    
                    {platforms.map((plat, i) => (
                        <div
                        key={i}
                        className='platform'
                        style={{
                            left: plat.x,
                            top: plat.y,
                            width: plat.width,
                            height: plat.height,
                            position: 'absolute'
                        }}
                        >
                            {plat.holeType && (
                               <div
                               className={`hole ${plat.holeType}`}
                                 style={{
                                    width: plat.width / 1,
                                    height: plat.height,
                                    position: 'absolute',
                                    left: plat.width / 2,
                                    bottom: 1}}
                               /> 
                            )}
                    </div>
                    ))}
                    

            
            {levelDone && (

                

                <div style={{ textAlign: 'center', marginTop: '20px', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'orange', padding: '20px', borderRadius: '10px'}}>
                   <h2>Level Completed!</h2>
                   <p>Time: {timer}s</p>
                   <p>Stars: {stars}</p>

                   <button onClick={resetGame}>Play Again</button>

                </div>            )}
        </div>
    );
};

export default TestLevel;