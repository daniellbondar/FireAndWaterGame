
import React, { useEffect, useRef, useState } from 'react';
import styles from './Level.module.css';
import background from '../images and icons/photo_2025-05-17_21-18-18-Picsart-AiImageEnhancer.jpg'
import bgmodal from '../images and icons/photo_2025-05-17_22-03-58.jpg'
import reload from '../images and icons/Refresh.svg'
import house from '../images and icons/Outline.svg'
import fire from '../images and icons/fireIcon.png'
import water from '../images and icons/waterIcon.png'


export const TestLevel = () => {
    const canvasRef = useRef(null);
    const [keys, setKeys] = useState({});
    const [timer, setTimer] = useState(0);
    const [levelDone, setLevelDone] = useState(false);
    const [stars, setStars] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [gameOverMessage, setGameOverMessage] = useState("");
    
    const [leverActivated, setLeverActivated] = useState(false);

   
    

    const gravity = 0.4;
    const jumpForce = -10;
    const speed = 4;

    
    

    const [platforms, setPlatforms] = useState([
        
        { x: 0, y: 680, width: 313, height: 20 },
        { x: 412, y: 680, width: 100, height: 10 },
        { x: 612, y: 680, width: 100, height: 10 },
        { x: 812, y: 680, width: 300, height: 10 },
        { x: 300, y: 690, width: 940, height: 10 },
        { x: 313, y: 681, width: 99, height: 9, holeType: 'fire' },
        { x: 513, y: 681, width: 99, height: 9, holeType: 'water' },
        { x: 712, y: 681, width: 100, height: 9, holeType: 'fire' },
        
        
        
        { x: 560, y: 240, width: 300, height: 10 },
        { x: 560, y: 230, width: 80, height: 10 },
        { x: 640, y: 231, width: 120, height: 9, holeType: 'water' },
        { x: 760, y: 230, width: 100, height: 10 },

        { x: 950, y: 600, width: 150, height: 20 },
        { x: 810, y: 500, width: 100, height: 20 },
        { x: 613, y: 500, width: 100, height: 20 },
        { x: 413, y: 500, width: 100, height: 20 },
        { x: 213, y: 500, width: 100, height: 20 },
        { x: 0, y: 450, width: 200, height: 20 },

        { x: 250, y: 370, width: 900, height: 10 },
        { x: 250, y: 360, width: 460, height: 10 },
        { x: 710, y: 361, width: 120, height: 9, holeType: 'water' },
        { x: 830, y: 360, width: 280, height: 10 },
        { x: 1000, y: 320, width: 100, height: 20 },

        { x: 850, y: 230, width: 150, height: 20 },
        { x: 1000, y: 140, width: 100, height: 20 },
        { x: 900, y: 120, width: 20, height: 120 },
        { x: 0, y: 120, width: 150, height: 20 },




        { x: 450, y: 100, width: 140, height: 20 },
        { x: 450, y: 80, width: 100, height: 20 },
        { x: 450, y: 60, width: 60, height: 20 },
        { x: 285, y: 40, width: 190, height: 20 },
        { x: 355, y: 105, width: 45, height: 20 },
        { x: 150, y: 130, width: 80, height: 10 },
        { x: 150, y: 121, width: 80, height: 9, holeType: 'fire' },
        { x: 230, y: 110, width: 75, height: 10 },
        { id: 36, x: 230, y: 120, width: 670, height: 20 },

        { x: 450, y: 300, width: 100, height: 20 }, 

        { x: 1100, y: 0, width: 20, height: 700 },
        { x: -20, y: 0, width: 20, height: 700 },

        
        { id: 40, x: 285, y: 0, width: 20, height: 60, activate: false, type: 'moving', direction: 'down', range: {from: 0, to: 60}, speed:2, goingDown: true}
        
    ]);

    


    const [levers, setLevers] = useState([
    {   id: 1, 
        x: 70, 
        y: 100, 
        width: 20,
        height: 20,
        direction: 'right', 
        activated: false,
        activatesPlatformId: 40 },

    {   id: 2, 
        x: 800, 
        y: 210, 
        width: 20,
        height: 20,
        direction: 'right', 
        activated: false,
        activatesPlatformId: 40 }
    ]);

    const activatePlatform = (platformId, isFromLeft) => {
        setPlatforms(prev =>
            prev.map(plat => {
                if (plat.id === platformId) {
                    return {
                        ...plat,
                        activate: true,
                        goingDown: !plat.goingDown // true — вниз, false — вгору
                    };
                }
                return plat;
            })
        );
    
        // також можна активувати ричаг:
        setLevers(prev =>
            prev.map(lever => 
                lever.activatesPlatformId === platformId
                    ? { ...lever, activated: !lever.activated }
                    : lever
            )
        );
    };

    const handlePlayerPush = (player) => {
        levers.forEach(lever => {
            const distanceX = Math.abs(player.x - lever.x);
            const distanceY = Math.abs(player.y - lever.y);
    
            if (distanceX < 20 && distanceY < 20) {
                const isFromLeft = player.x < lever.x;
                activatePlatform(lever.activatesPlatformId, isFromLeft);
            }
        });
    };


    const drawLevers = (ctx) => {
        levers.forEach ((lever) => {
            ctx.fillStyle = lever.activated ? 'green' : 'red';
            ctx.fillRect(lever.x, lever.y, lever.width, lever.height);

            ctx.strokeStyle = 'black';
            ctx.lineWidth= 2;
            ctx.beginPath();
            
            const centerX = lever.x + lever.width / 2;
            const centerY = lever.y + lever.height / 2;

            const offsetX = lever.direction === 'left' ? -10 : 10;
            const offsetY = lever.activated ? -10 : 10;

            ctx.moveTo (centerX, centerY);
            ctx.lineTo(centerX + offsetX, centerY + offsetY);
            ctx.stroke();
        })
    }



    useEffect(() => {
        
        

        

        const interval = setInterval(() => {
            
            

            setPlatforms(prev =>
                prev.map(plat => {
                    if (plat.type === 'moving' && plat.activate) {

                        let newY = plat.y;
                        // let newGoingDown = plat.goingDown;
                        let newActivate = true;
            
                        if (plat.goingDown) {
                            newY -= plat.speed;
                            if (newY <= plat.range.to) {
                                newY = plat.range.to;
                                // newGoingDown = true;
                                newActivate = false;
                            }
                        } else {
                            newY += plat.speed;
                            if (newY >= plat.range.from) {
                                newY = plat.range.from;
                                // newGoingDown = true;
                                newActivate = false;
                            }
                        }
            
                        console.log(`ID ${plat.id} | y: ${newY}`);
            
                        return {
                            ...plat,
                            y: newY,
                            // goingDown: newGoingDown,
                            activate: newActivate
                        };
                    }
                    return plat;
                })
            );
            
            
        }, 16);
        
        console.log(`ID ${plat.id} | y: ${plat.y} | goingDown: ${plat.goingDown} | activate : ${plat.activate}`);
        return () => clearInterval(interval);
       
    }, []);

    
    


    

    

    const plat = platforms[0];
    const groundY = plat.y + plat.height;


    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };
    

    useEffect(() => {

        
        
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
            }, 500);
            return () => clearTimeout(timeout);
        }
    }, [levelDone])

    const calculateStars = (time) => {
        if (time <= 40) return 3;
        if (time > 40 & time <= 60) return 2;
        if ( time > 80) return 1;
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






    


    // const fireIcon = new Image();
    // fireIcon.src = fire;

    // const waterIcon = new Image();
    // waterIcon.src = water;
    

    const firePlayer = useRef({
        x: 100,
        y: 600,
        width: 40,
        height: 40,
        velY: 0,
        playerType: 'fire',
        onGround: false,
        color: 'rgb(212, 57, 1)',
        controls: { left: 'a', right: 'd', jump: 'w', left: 'ф', right: 'в', jump: 'ц' },
    
    });

    const waterPlayer = useRef({
        x: 200,
        y: 590,
        width: 40,
        height: 40,
        velY: 0,
        playerType: 'water',
        onGround: false,
        color: 'rgb(0, 7, 212)',
        controls: { left: 'ArrowLeft', right: 'ArrowRight', jump: 'ArrowUp' }
    });

    
    // function drawFire(ctx, x, y, width, height) {
    //     ctx.beginPath();
    //     ctx.fillStyle = 'red';
    //     ctx.moveTo(x + width / 2, y);
    //     ctx.bezierCurveTo(x, y + height / 3, x + width, y + height / 3, x + width / 2, y + height);
    //     ctx.closePath();
    //     ctx.fill();
    // }

    // function drawWater(ctx, x, y, width, height) {
    //     ctx.beginPath();
    //     ctx.fillStyle = 'blue';
    //     ctx.moveTo(x + width / 2, y);
    //     ctx.quadraticCurveTo(x, y + height, x + width / 2, y + height);
    //     ctx.quadraticCurveTo(x + width, y + height, x + width / 2, y);
    //     ctx.closePath();
    //     ctx.fill();
    // }


    // function drawPlayer (ctx, player) {
    //     let img;

        

    //     if (player.playerType === 'fire') {
    //         img = fireIcon;
    //     } else if (player.playerType === 'water') {
    //         img = waterIcon;
    //     }

    //     if (img.complete) {
    //         ctx.drawImage(img, player.x, player.y, player.width, player.height);
    //     } else {
    //         ctx.fillStyle = player.playerType === 'fire' ? 'red' : 'blue';
    //     ctx.fillRect(player.x, player.y, player.width, player.height);
    // }
    // }



    const finishZones = [
        { x: 310, y: 70, width: 40, height: 50, color: 'red', player: 'fire' },
        { x: 405, y: 70, width: 40, height: 50, color: 'blue', player: 'water' }
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

        levers.forEach((lever) => {
            const isColliding = (
                player.x < lever.x + lever.width &&
                player.x + player.width > lever.x &&
                player.y < lever.y + lever.height &&
                player.y + player.height > lever.y
            );

            const pushingFromCorrectSide = (
                lever.direction === 'left' && player.x + player.width < lever.x + 5 ||
                lever.direction === 'right' && player.x >= lever.x + lever.width -5
            );

            if (isColliding && pushingFromCorrectSide && !lever.activated) {
                lever.activated = true;
                activatePlatform(lever.activatesPlatformId);
                console.log('Lever activated!!!');
                
            }
        })
    
        // Колізія з платформами згори
        platforms.forEach((plat) => {

            if (plat.holeType) {
                return;
            }

 
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
           const nowOverlappingX = player.x + player.width > plat.x && player.x < plat.x + plat.width;
           const isWithinY = player.y + player.height > plat.y && player.y < plat.y + plat.height;

           if (wasLeft && nowOverlappingX && isWithinY) {
            player.x = plat.x - player.width;
           }

           if (wasRight && nowOverlappingX && isWithinY) {
            player.x = plat.x + plat.width;
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
            


            
            }

            

           
            

            
        });
    
        // Колізія з землею
        if (player.y + player.height >= groundY) {
            player.y = groundY - player.height;
            player.velY = 0;
            player.onGround = true;
        }
    };

    const checkIfPlayerDied = (playerRef, playerType, platforms, setGameOver, setGameOverMessage) => {
        const player = playerRef.current;
    
        for (let plat of platforms) {
            // Якщо є дірка і вона чужа
            if (plat.holeType && plat.holeType !== playerType) {
                const playerBottom = player.y + player.height;
                const playerRight = player.x + player.width;
                const platBottom = plat.y + plat.height;
    
                const isInsideHorizontal =
                    player.x < plat.x + plat.width &&
                    playerRight > plat.x;
    
                const isInsideVertical =
                    playerBottom > plat.y && player.y < plat.y + plat.height;
    
                if (isInsideHorizontal && isInsideVertical) {
                    console.log(`${playerType} died in ${plat.holeType} hole`);
                    setGameOver(true);
                    setGameOverMessage(`Player ${playerType} died!`);
                    setTimer(0);
                    return; // щоб не спрацьовувало кілька разів
                }
            }
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

            checkIfPlayerDied(firePlayer, 'fire', platforms, setGameOver, setGameOverMessage);
            checkIfPlayerDied(waterPlayer, 'water', platforms, setGameOver, setGameOverMessage);



            handleMovement(firePlayer.current);
            handleMovement(waterPlayer.current);

            handlePlayerPush(firePlayer.current);
            handlePlayerPush(waterPlayer.current);

            checkIfPlayerDied(firePlayer, 'fire', platforms, setGameOver, setGameOverMessage);
            checkIfPlayerDied(waterPlayer, 'water', platforms, setGameOver, setGameOverMessage);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

        

            

            // Platforms
            

            
            // ctx.fillRect(100, groundY, canvas.width, 20);

        

            // Finish zones
            finishZones.forEach((zone) => {
                ctx.fillStyle = zone.color;
                ctx.fillRect(zone.x, zone.y, zone.width, zone.height);
            });

            //Players
           [firePlayer.current, waterPlayer.current].forEach((p) => {
                ctx.fillStyle = p.color;
                ctx.fillRect(p.x, p.y, p.width, p.height);
            }); 


            

        // drawPlayer(ctx, firePlayer.current);
        // drawPlayer(ctx, waterPlayer.current);

        // Малюємо Fire
// if (firePlayer.current.playerType === 'fire') {
//     drawFire(
//         ctx,
//         firePlayer.current.x,
//         firePlayer.current.y,
//         firePlayer.current.width,
//         firePlayer.current.height
//     );
// }

// // Малюємо Water
// if (waterPlayer.current.playerType === 'water') {
//     drawWater(
//         ctx,
//         waterPlayer.current.x,
//         waterPlayer.current.y,
//         waterPlayer.current.width,
//         waterPlayer.current.height
//     );
// }

            

            


            ctx.fillStyle = 'rgb(170, 170, 170)';

            

            platforms.forEach((plat) => {
                if (!plat.holeType) {
                    ctx.fillStyle = 'gray';
                } else if (plat.holeType === 'fire') {
                    ctx.fillStyle = 'rgba(255, 68, 0, 0.5)';
                } else if (plat.holeType === 'water') {
                    ctx.fillStyle = 'rgba(0, 8, 255, 0.5)';
                }

                if (plat.type === 'moving' && plat.activate) {
                    plat.y -= 1;
                    
                }
            
                ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
            });

            drawLevers(ctx);

            

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
    }, [keys, platforms, setGameOver, setGameOverMessage]);

    return (
        <div className= {styles.main}
        style={{
            width: '100%',
            height: '100vh'
        }}>
            <canvas
                ref={canvasRef}
                width={1100}
                height={700}
                style={{
                    border: '1px solid black',
                    display: 'block',
                    margin: '0 auto',
                    backgroundImage: `url(${background})`,
                    backgroundSize: 'cover',
                    }}/>

                    <div className={styles.timerBadge}>

                        <img src={house} className={styles.houseIcon}/>
                        
                    {formatTime(timer)}

                    <img src={reload} className={styles.reloadIcon} onClick={() => window.location.reload()}/>
                    
                    </div>

                    

                    
                    {platforms.map((plat, i) => (
                        <div
                        key={i}
                        className={styles.platform}
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
                               className={`${styles.hole} ${plat.holeType} `}
                                 style={{
                                    width: plat.width,
                                    height: plat.height,
                                    position: 'absolute',
                                    left: plat.x,
                                    zIndex: 3,
                                    }}
                               /> 
                            )}
                    </div>
                    ))}


{finishZones.map((zone, index) => (
  <div
    key={index}
    className={`${styles.finishZone} ${styles[zone.player]}`}
    style={{
      left: zone.x,
      top: zone.y,
      width: zone.width,
      height: zone.height,
    }}
  />
))}




                    
                    
            {gameOver && (
                <div style={{ backgroundImage: `url(${bgmodal})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center top -20px',
                
                width:'350px', 
                height: '150px',
                textAlign: 'center', 
                marginTop: '20px', 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)', 
                 
                padding: '20px', 
                borderRadius: '15px'}}>

                    <h2 className={styles.gameOver}>Game over</h2>
                    <p className={styles.gameOverMessage}>{gameOverMessage}</p>
                    <button onClick={() => window.location.reload()} className={styles.playAgain}>Play again</button>

                </div>
            )}


            
            {levelDone && (

                

                <div style={{ backgroundImage: `url(${bgmodal})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center top -20px',
                              
                              width:'350px', 
                              height: '150px',
                              textAlign: 'center', 
                              marginTop: '20px', 
                              position: 'absolute', 
                              top: '50%', 
                              left: '50%', 
                              transform: 'translate(-50%, -50%)', 
                               
                              padding: '20px', 
                              borderRadius: '15px'}}>
                   <h2 className={styles.lvlCompleted}>Level Completed!</h2>
                   <p className={styles.time}>Time: {formatTime(timer)}</p>

                   
                   <p className={styles.stars}>

                    {[...Array(stars)].map(( _ , i) => (
                        <>



                        <span className={styles.star} key={i} style={{ animationDelay: `${i * 0.6}s`}}> {stars === 3 && '⭐️'} </span>

                        <span className={styles.star} key={i}> {stars === 2 && '⭐️'} </span>

                        <span className={styles.star} key={i} > {stars === 1 && '⭐️'} </span>
                        </>

                    ))}

                   </p>
                   

                        
                    
                   
                   <button onClick={resetGame} className={styles.again}>Play again</button>

                </div>            )}
        </div>
    );
};

export default TestLevel;