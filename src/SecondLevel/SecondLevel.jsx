import React, { useEffect, useRef, useState, useCallback } from 'react'; // Added useCallback
import { Link, useNavigate } from 'react-router-dom';
import { useLevelData } from '../hooks/useLevelData';
import styles from './SecondLevel.module.css';
import background from '../images and icons/photo_2025-05-17_21-18-18-Picsart-AiImageEnhancer.jpg'
import bgmodal from '../images and icons/photo_2025-05-17_22-03-58.jpg'
import reload from '../images and icons/Refresh.svg'
import house from '../images and icons/Outline.svg'
// import fire from '../images and icons/fireIcon.png' // Assuming you might use these later
// import water from '../images and icons/waterIcon.png'

const StarsDisplay = ({ count }) => (
    <div className={styles.modalStarsContainer}>
        {/* 1. Фонові (тьмяні) зірки - вони завжди статичні */}
        <div className={styles.starsBackground}>
            {[...Array(3)].map((_, i) => (
                <span key={`bg-${i}`} className={styles.modalStarPlaceholder}>
                    ⭐️
                </span>
            ))}
        </div>

        {/* 2. Активні (яскраві) зірки - з'являються з анімацією поверх фонових */}
        <div className={styles.starsForeground}>
            {[...Array(count)].map((_, i) => (
                <span 
                    key={`fg-${i}`} 
                    className={styles.modalStarActive}
                    style={{ animationDelay: `${i * 0.6}s` }}
                >
                    ⭐️
                </span>
            ))}
        </div>
    </div>
);

export const TestLevel = () => {
    const canvasRef = useRef(null);
    const [keys, setKeys] = useState({});
    const [timer, setTimer] = useState(0);
    const [levelDone, setLevelDone] = useState(false);
    const [stars, setStars] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [gameOverMessage, setGameOverMessage] = useState("");
    const { saveLevelProgress } = useLevelData();
    const [nextLevelUnlocked, setNextLevelUnlocked] = useState(false);
    
    
    const navigate = useNavigate();

    
    const goToNextLevel = () => {
        
        navigate('/level3'); 
    };

    const goToPreviousLevel = () => {
        navigate('/level1')
    }

    // const [leverActivated, setLeverActivated] = useState(false); // Not used in this request

    const gravity = 0.4;
    const jumpForce = -10;
    const speed = 4;

    // --- NEW STATE FOR BUTTONS AND MOVING PLATFORMS ---
    const [buttons, setButtons] = useState([
        { id: 'button1', x: 150, y: 200, width: 60, height: 10, originalY: 670, pressedYOffset: 5, isPressed: false, color: 'rgb(255, 140, 0)', pressedColor: 'rgb(146, 80, 0)' },
        { id: 'button2', x: 20, y: 230, width: 60, height: 10, originalY: 230, pressedYOffset: 5, isPressed: false, color: 'rgb(255, 140, 0)', pressedColor: 'rgb(146, 80, 0)' },
    ]);

    const [movingPlatforms, setMovingPlatforms] = useState([
        { id: 'mp1', x: 150, y: 240, width: 130, height: 20, originalY: 240, targetY: 130, currentY: 240, moveSpeed: 0.5, color: 'gray' },
        { id: 'mp2', x: 150, y: 370, width: 130, height: 20, originalY: 370, targetY: 260, currentY: 370, moveSpeed: 0.5, color: 'gray' },
    ]);
    const [anyButtonPressed, setAnyButtonPressed] = useState(false);
    // --- END NEW STATE ---


    const [staticPlatforms, setStaticPlatforms] = useState([ // Renamed for clarity
        { x: -20, y: 0, width: 20, height: 700 }, 
        { x: 1100, y: 0, width: 20, height: 700 }, 

        { x: 0, y: 100, width: 250, height: 20 },
        
        { x: 250, y: 110, width: 550, height: 10 },
        { x: 400, y: 100, width: 100, height: 10 },
        { x: 650, y: 100, width: 150, height: 10 },
        { x: 250, y: 101, width: 150, height: 9, holeType: 'fire' },
        { x: 500, y: 101, width: 150, height: 9, holeType: 'water' },

        { x: 800, y: 100, width: 20, height: 160 },
        { x: 0, y: 240, width: 150, height: 20 },
        { x: 280, y: 240, width: 180, height: 20 },
        { x: 450, y: 250, width: 200, height: 10 },
        { x: 460, y: 241, width: 170, height: 9, holeType: 'fire' },
        { x: 630, y: 240, width: 170, height: 20 },

        { x: 520, y: 210, width: 50, height: 20 },

        { x: 390, y: 300, width: 20, height: 200},
        { x: 390, y: 500, width: 450, height: 10}, 
        { x: 410, y: 490, width: 50, height: 10},
        { x: 570, y: 490, width: 80, height: 10},
        { x: 760, y: 490, width: 80, height: 10},
        { x: 460, y: 491, width: 110, height: 9, holeType: 'fire' },
        { x: 650, y: 491, width: 110, height: 9, holeType: 'water' },

        { x: 760, y: 350, width: 350, height: 20},


        { x: 0, y: 690, width: 1300, height: 10 }, 
        { x: 0, y: 680, width: 300, height: 10 }, 
        { x: 540, y: 680, width: 100, height: 10 },
        { x: 880, y: 680, width: 220, height: 10 },
        { x: 640, y: 681, width: 240, height: 9, holeType: 'water' },
        { x: 300, y: 681, width: 240, height: 9, holeType: 'fire' },

        { x: 370, y: 640, width: 100, height: 20 },
        { x: 710, y: 640, width: 100, height: 20 },

        { x: 0, y: 625, width: 100, height: 20 },
        { x: 180, y: 560, width: 90, height: 20 },
        { x: 330, y: 470, width: 70, height: 20 },
    ]);

    const groundY = staticPlatforms; 


    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };


    useEffect(() => {
        let timerInterval;
        if (!levelDone && !gameOver) { // Stop timer on gameOver too
            timerInterval = setInterval(() => {
                setTimer((prev) => prev + 1);
            }, 1000);
        }
        return () => clearInterval(timerInterval);
    }, [levelDone, gameOver]);

    useEffect(() => {
        if (levelDone) {
            const timeout = setTimeout(showModal, 500);
            return () => clearTimeout(timeout);
        }
    }, [levelDone]);

    const calculateStars = useCallback((time) => { // useCallback for stability
        if (time <= 40) return 3;
        if (time > 40 && time <= 60) return 2;
        return 1; // Adjusted condition based on user text.
        
    }, []);


    const showModal = useCallback(() => {
        const earnedStars = calculateStars(timer);
        setStars(earnedStars);
    }, [timer, calculateStars]);


    const firePlayer = useRef({
        x: 100, 
        y: 50, 
        width: 40, 
        height: 40, 
        velY: 0, 
        playerType: 'fire', 
        onGround: false,
        standingOnPlatformId: null, // NEW PROPERTY
        color: 'rgb(255, 89, 29)', 
        controls: { left: 'a', right: 'd', jump: 'w' },
        cyrillic_controls: { left: 'ф', right: 'в', jump: 'ц' }
    });

    const waterPlayer = useRef({
        x: 150, y: 50, width: 40, height: 40, velY: 0, playerType: 'water', onGround: false,
        standingOnPlatformId: null, // NEW PROPERTY
        color: 'rgb(0, 7, 212)', controls: { left: 'ArrowLeft', right: 'ArrowRight', jump: 'ArrowUp' }
    });

// In resetGame function:
    const resetGame = () => {

            setLevelDone(false);
    setTimer(0);
    setStars(0);
    setGameOver(false);
    setGameOverMessage("");

    firePlayer.current.x = 100;
    firePlayer.current.y = 50; // Start above ground
    firePlayer.current.velY = 0;
    firePlayer.current.onGround = false;

    waterPlayer.current.x = 150;
    waterPlayer.current.y = 50; // Start above ground
    waterPlayer.current.velY = 0;
    waterPlayer.current.onGround = false;

    // Reset buttons and moving platforms
    setButtons(prevButtons => prevButtons.map(b => ({ ...b, isPressed: false })));
    setMovingPlatforms(prevMovingPlats => prevMovingPlats.map(mp => ({ ...mp, currentY: mp.originalY })));
    setAnyButtonPressed(false);
        // ... other resets
        firePlayer.current.velY = 0;
        firePlayer.current.onGround = false;
        firePlayer.current.standingOnPlatformId = null; // RESET

        waterPlayer.current.velY = 0;
        waterPlayer.current.onGround = false;
        waterPlayer.current.standingOnPlatformId = null; // RESET
        // ... rest of reset
    };




    const finishZones = [
        { x: 360, y: 190, width: 40, height: 50, color: 'gray', playerType: 'fire' },
        { x: 695, y: 190, width: 40, height: 50, color: 'gray', playerType: 'water' }
    ];


    const hasReachedFinish = (player, zone) => (
        player.x < zone.x + zone.width &&
        player.x + player.width > zone.x &&
        player.y < zone.y + zone.height &&
        player.y + player.height > zone.y
    );

    const handleMovement = useCallback((playerRef, currentFrameMovingPlatforms, currentStaticPlatforms) => {
        const player = playerRef.current;
        const controls = player.controls;
        const cyrillic_controls = player.cyrillic_controls || {};

        const prevY = player.y;
        const prevX = player.x;
        const wasOnGroundInitially = player.onGround;

        const moveLeft = keys[controls.left] || (player.playerType === 'fire' && keys[cyrillic_controls.left]);
        const moveRight = keys[controls.right] || (player.playerType === 'fire' && keys[cyrillic_controls.right]);
        const doJump = keys[controls.jump] || (player.playerType === 'fire' && keys[cyrillic_controls.jump]);

        if (moveLeft) player.x -= speed;
        if (moveRight) player.x += speed;

        if (doJump && wasOnGroundInitially) {
            player.velY = jumpForce;
            player.standingOnPlatformId = null; // Player jumped, no longer "stuck" to platform
            // player.onGround will be set to false next, then re-evaluated
        }

        // Apply gravity AFTER potential pre-adjustment from platform movement (in main loop)
        player.velY += gravity;
        player.y += player.velY;

        player.onGround = false; // Assume not on ground until collision proves otherwise

        const allPlatforms = [
            ...currentStaticPlatforms.filter(p => !p.holeType),
            ...currentFrameMovingPlatforms.map(mp => ({
                id: mp.id, x: mp.x, y: mp.currentY, width: mp.width, height: mp.height, isMoving: true
            }))
        ];

        let landedOnMovingThisFrameId = null;
        let landedOnStaticThisFrame = false;

        allPlatforms.forEach((plat) => {
            // Check for landing: Was player above or at the same level, and now their feet are on the platform?
            const wasPlayerFeetAboveOrAtPlatTop = prevY + player.height <= plat.y + 1; // +1 for tolerance
            const isPlayerFallingOrStationary = player.velY >= -0.01; // Account for tiny residual velocity
            
            const isPlayerFeetCurrentlyOnPlat = player.y + player.height >= plat.y &&
                                               player.y + player.height <= plat.y + plat.height + 1; // Small tolerance
            const isPlayerHorizontallyAligned = player.x + player.width > plat.x && player.x < plat.x + plat.width;

            if (wasPlayerFeetAboveOrAtPlatTop && isPlayerFallingOrStationary && isPlayerFeetCurrentlyOnPlat && isPlayerHorizontallyAligned) {
                player.y = plat.y - player.height;
                player.velY = 0;
                player.onGround = true;
                if (plat.isMoving) {
                    landedOnMovingThisFrameId = plat.id;
                } else {
                    landedOnStaticThisFrame = true;
                }
            }

            // Head bump
            const wasPlayerHeadBelowOrAtPlatBottom = prevY >= plat.y + plat.height -1;
            const isPlayerMovingUp = player.velY < 0;
            const isPlayerHeadCurrentlyHittingPlat = player.y <= plat.y + plat.height && player.y >= plat.y;
             if (wasPlayerHeadBelowOrAtPlatBottom && isPlayerMovingUp && isPlayerHeadCurrentlyHittingPlat && isPlayerHorizontallyAligned) {
                player.y = plat.y + plat.height;
                player.velY = 0;
            }
            
            // Side collisions
            const isPlayerVerticallyWithinPlat = player.y + player.height > plat.y && player.y < plat.y + plat.height;
            if (isPlayerVerticallyWithinPlat) {
                 const wasPlayerLeftOfPlat = prevX + player.width <= plat.x;
                 const wasPlayerRightOfPlat = prevX >= plat.x + plat.width;
                 if (wasPlayerLeftOfPlat && isPlayerHorizontallyAligned) player.x = plat.x - player.width;
                 if (wasPlayerRightOfPlat && isPlayerHorizontallyAligned) player.x = plat.x + plat.width;
            }
        });
        
        if (landedOnMovingThisFrameId) {
            player.standingOnPlatformId = landedOnMovingThisFrameId;
        } else if (landedOnStaticThisFrame) {
            player.standingOnPlatformId = null;
        } else if (!player.onGround) { // If no landing collision set onGround to true
            player.standingOnPlatformId = null;
        }
        // If player is onGround but standingOnPlatformId is null, it means they are on a static platform.

        if (player.y + player.height > groundY) {
            player.y = groundY - player.height;
            player.velY = 0;
            player.onGround = true;
            player.standingOnPlatformId = null;
        }
    }, [keys, gravity, jumpForce, speed, groundY]);

    const checkIfPlayerDied = useCallback((playerRef, currentStaticPlatforms) => {
        const player = playerRef.current;
        for (let plat of currentStaticPlatforms) {
            if (plat.holeType && plat.holeType !== player.playerType) {
                if (player.x < plat.x + plat.width && player.x + player.width > plat.x &&
                    player.y < plat.y + plat.height && player.y + player.height > plat.y) {
                    setGameOver(true); setGameOverMessage(`Player ${player.playerType} perished!`);
                    return true;
                }
            }
        }
        return false;
    }, []);


    useEffect(() => {
        const handleKeyDown = (e) => {
            const keyToStore = e.key.length === 1 ? e.key.toLowerCase() : e.key;
            // console.log("KeyDown: ", keyToStore);
            setKeys((prevKeys) => ({ ...prevKeys, [keyToStore]: true }));
        };
        const handleKeyUp = (e) => {
            const keyToStore = e.key.length === 1 ? e.key.toLowerCase() : e.key;
            // console.log("KeyUp: ", keyToStore);
            setKeys((prevKeys) => ({ ...prevKeys, [keyToStore]: false }));
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        let animationFrameId;
        const loop = () => {
            if (gameOver || levelDone) {
                animationFrameId = requestAnimationFrame(loop); return;
            }
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            if (!ctx) {
                animationFrameId = requestAnimationFrame(loop); return;
            }

            // 1. Update Button States
            let anyBtnPressedThisFrame = false;
            const updatedButtons = buttons.map(btn => {
                const isFireOn = firePlayer.current.x < btn.x + btn.width && firePlayer.current.x + firePlayer.current.width > btn.x &&
                                 firePlayer.current.y + firePlayer.current.height >= btn.originalY && firePlayer.current.y + firePlayer.current.height <= btn.originalY + btn.height + 5;
                const isWaterOn = waterPlayer.current.x < btn.x + btn.width && waterPlayer.current.x + waterPlayer.current.width > btn.x &&
                                  waterPlayer.current.y + waterPlayer.current.height >= btn.originalY && waterPlayer.current.y + waterPlayer.current.height <= btn.originalY + btn.height + 5;
                const currentlyPressed = isFireOn || isWaterOn;
                if (currentlyPressed) anyBtnPressedThisFrame = true;
                return { ...btn, isPressed: currentlyPressed };
            });
            // Set button state immediately for visual feedback
            if (JSON.stringify(buttons) !== JSON.stringify(updatedButtons)) { // Only update if changed
                setButtons(updatedButtons);
            }
            if (anyButtonPressed !== anyBtnPressedThisFrame) {
                setAnyButtonPressed(anyBtnPressedThisFrame);
            }


            // 2. Calculate New Moving Platform Positions and store deltas
            const platformDeltas = {}; // Key: platformId, Value: deltaY
            const newCalculatedMovingPlatforms = movingPlatforms.map(mp => {
                const prevPlatformY = mp.currentY;
                let nextPlatformY = mp.currentY;
                if (anyBtnPressedThisFrame) {
                    if (nextPlatformY > mp.targetY) nextPlatformY = Math.max(mp.targetY, nextPlatformY - mp.moveSpeed);
                } else {
                    if (nextPlatformY < mp.originalY) nextPlatformY = Math.min(mp.originalY, nextPlatformY + mp.moveSpeed);
                }
                if (prevPlatformY !== nextPlatformY) {
                    platformDeltas[mp.id] = nextPlatformY - prevPlatformY;
                }
                return { ...mp, currentY: nextPlatformY };
            });

            // 3. Pre-Adjust Player Position IF THEY WERE ON A MOVING PLATFORM LAST FRAME
            [firePlayer.current, waterPlayer.current].forEach(player => {
                // console.log(`Loop Start - Player ${player.playerType}: onGround=${player.onGround}, standingOn=${player.standingOnPlatformId}, Y=${player.y.toFixed(2)}, velY=${player.velY.toFixed(2)}`);
                if (player.onGround && player.standingOnPlatformId) { 
                    const deltaY = platformDeltas[player.standingOnPlatformId];
                    if (deltaY) { 
                        // console.log(`Player ${player.playerType} was on ${player.standingOnPlatformId}, platform moved by ${deltaY.toFixed(2)}. Adjusting player Y from ${player.y.toFixed(2)} to ${(player.y + deltaY).toFixed(2)}`);
                        player.y += deltaY;
                        // If platform moved up and player was slightly falling, reset velY to stick better
                        if (deltaY < 0 && player.velY > 0.01) { 
                            player.velY = 0; 
                        }
                    }
                }
            });
            
            // 4. Update React state for moving platforms
            // Only update if positions actually changed to avoid unnecessary re-renders from this
            if (JSON.stringify(movingPlatforms.map(mp=>mp.currentY)) !== JSON.stringify(newCalculatedMovingPlatforms.map(mp=>mp.currentY))) {
                setMovingPlatforms(newCalculatedMovingPlatforms);
            }


            // 5. Handle Player Movement & Collisions (updates onGround, standingOnPlatformId for NEXT frame)
            handleMovement(firePlayer, newCalculatedMovingPlatforms, staticPlatforms);
            handleMovement(waterPlayer, newCalculatedMovingPlatforms, staticPlatforms);

            // console.log(`Loop End - Player ${firePlayer.current.playerType}: onGround=${firePlayer.current.onGround}, standingOn=${firePlayer.current.standingOnPlatformId}, Y=${firePlayer.current.y.toFixed(2)}, velY=${firePlayer.current.velY.toFixed(2)}`);
            // console.log(`Loop End - Player ${waterPlayer.current.playerType}: onGround=${waterPlayer.current.onGround}, standingOn=${waterPlayer.current.standingOnPlatformId}, Y=${waterPlayer.current.y.toFixed(2)}, velY=${waterPlayer.current.velY.toFixed(2)}`);

            // 6. Check if Players Died
            if (checkIfPlayerDied(firePlayer, staticPlatforms) || checkIfPlayerDied(waterPlayer, staticPlatforms)) {
                 animationFrameId = requestAnimationFrame(loop); // Keep looping to show game over modal
                 return;
            }

            // 7. Drawing
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            staticPlatforms.forEach((plat) => {
                if (!plat.holeType) ctx.fillStyle = 'gray';
                else if (plat.holeType === 'fire') ctx.fillStyle = 'rgba(255, 68, 0, 0.5)';
                else if (plat.holeType === 'water') ctx.fillStyle = 'rgba(0, 8, 255, 0.5)';
                ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
            });
            
            updatedButtons.forEach(btn => {
                ctx.fillStyle = btn.isPressed ? btn.pressedColor : btn.color;
                const buttonDrawY = btn.isPressed ? btn.originalY + btn.pressedYOffset : btn.originalY;
                ctx.fillRect(btn.x, buttonDrawY, btn.width, btn.height - (btn.isPressed ? btn.pressedYOffset : 0));
            });
            
            newCalculatedMovingPlatforms.forEach(mp => {
    // 1. Малюємо саму платформу
    ctx.fillStyle = mp.color;
    ctx.fillRect(mp.x, mp.currentY, mp.width, mp.height);

    // 2. Визначаємо колір лінії на основі стану кнопок
    // Використовуємо 'anyButtonPressed', яке вже розраховується в кожному кадрі
    const lineThickness = 3;
    const lineColor = anyButtonPressed ? 'rgb(255, 140, 0)' : 'rgb(255, 182, 93)'; // Яскравий, коли кнопка натиснута; блідий, коли ні.

    // 3. Розраховуємо правильні координати для лінії (відносно полотна)
    const lineWidth = mp.width * 0.5; // Довжина лінії
    const lineY = mp.currentY + (mp.height / 2); // Вертикальний центр платформи
    const lineStartX = mp.x + (mp.width - lineWidth) / 2; // Горизонтальний початок лінії (щоб була по центру)

    // 4. Малюємо лінію-індикатор
    ctx.beginPath();
    ctx.moveTo(lineStartX, lineY);
    ctx.lineTo(lineStartX + lineWidth, lineY);
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineThickness;
    ctx.stroke();
});

             finishZones.forEach((zone) => {
                ctx.fillStyle = zone.color; ctx.fillRect(zone.x, zone.y, zone.width, zone.height);
                ctx.strokeStyle = 'rgb(0, 7, 212)';
                ctx.lineWidth = 2;

                if (zone.playerType === 'fire') {
                    ctx.strokeStyle = 'rgb(255, 90, 30)';
                }

                ctx.strokeRect(zone.x, zone.y, zone.width, zone.height)
            });

            [firePlayer.current, waterPlayer.current].forEach((p) => {
                ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, p.width, p.height);
            });

            
            const fireDone = hasReachedFinish(firePlayer.current, finishZones[0]);
            const waterDone = hasReachedFinish(waterPlayer.current, finishZones[1]);
            

                if (fireDone && waterDone && !levelDone && !gameOver) {
    
                    const earnedStars = calculateStars(timer);
                    saveLevelProgress('level2', timer, earnedStars); 
                    setLevelDone(true); 
                    if (earnedStars >= 2) {
                    setNextLevelUnlocked(true);
                } else {
                    setNextLevelUnlocked(false);
                }
}
                
            
            animationFrameId = requestAnimationFrame(loop);
        };
        loop();
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            cancelAnimationFrame(animationFrameId);
        };
    }, [gameOver, levelDone, staticPlatforms, buttons, movingPlatforms, anyButtonPressed, 
        handleMovement, checkIfPlayerDied, keys, saveLevelProgress, calculateStars, timer]);

    return (
        <div className={styles.main} style={{ width: '100%', height: '100vh' }}>
            <canvas ref={canvasRef} width={1100} height={700}
                style={{ border: '1px solid black', display: 'block', margin: '0 auto',
                         backgroundImage: `url(${background})`, backgroundSize: 'cover' }} />
            <div className={styles.timerBadge}>
                <Link to='/'>
                <img src={house} alt="Home" className={styles.houseIcon} />
                </Link>
                 {formatTime(timer)}
                <img src={reload} alt="Reload" className={styles.reloadIcon} onClick={resetGame} />
            </div>


            {gameOver && ( <div style={{ backgroundImage: `url(${bgmodal})`, backgroundSize: 'cover', backgroundPosition: 'center top -20px',
                    width: '350px', height: '150px', textAlign: 'center', position: 'absolute',
                    top: '50%', left: '50%', transform: 'translate(-50%, -50%)', padding: '20px', borderRadius: '15px' }}>
                    <h2 className={styles.gameOver}>Game over</h2> 
                    <p className={styles.gameOverMessage}>{gameOverMessage}</p>
                    <button onClick={resetGame} className={styles.playAgain}>Play again</button> </div> )}


            {/* {levelDone && (  */}
                <div style={{ backgroundImage: `url(${bgmodal})`, backgroundSize: 'cover', backgroundPosition: 'center top -20px',
                    width: '350px', height: '150px', textAlign: 'center', position: 'absolute',
                    top: '50%', left: '50%', transform: 'translate(-50%, -50%)', padding: '20px', borderRadius: '15px' }}>
                    <h2 className={styles.lvlCompleted}>Level Completed!</h2> 
                    <p className={styles.time}>Time: {formatTime(timer)}</p>
                    <StarsDisplay count={stars} />
                    <button onClick={resetGame} className={styles.again}>Play again</button> 
                    <button onClick={goToNextLevel} className={styles.nextLevel} disabled={!nextLevelUnlocked}>  &raquo; </button>
                    <button onClick={goToPreviousLevel} className={styles.previousLevel}> &laquo; </button>
                    </div> 
                 {/* )}  */}

                    {/* {!nextLevelUnlocked && (
                        <p className={styles.unlockMessage}>
                            (Earn 2+ stars to unlock the next level)
                        </p>
                    )} */}
        </div>
    );
};
export default TestLevel;