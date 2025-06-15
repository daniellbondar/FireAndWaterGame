import React, { useEffect, useRef, useState, useCallback } from 'react'; // Added useCallback
import { Link, useNavigate } from 'react-router-dom';
import { useLevelData } from '../hooks/useLevelData';
import { useTranslation } from 'react-i18next';
import styles from './SecondLevel.module.css';
import background from '../images and icons/photo_2025-05-17_21-18-18-Picsart-AiImageEnhancer.jpg'
import bgmodal from '../images and icons/photo_2025-05-17_22-03-58.jpg'
import reload from '../images and icons/Refresh.svg'
import house from '../images and icons/Outline.svg'
import fullScreenIcon from '../images and icons/Full_alt.svg'
import exitFullScreenIcon from '../images and icons/Reduce.svg'

// import fire from '../images and icons/fireIcon.png' // Assuming you might use these later
// import water from '../images and icons/waterIcon.png'

const DESIGN_WIDTH = 1100;
const DESIGN_HEIGHT = 700;

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
    const [isFullScreen, setIsFullScreen] = useState(false);
    
        const gameContainerRef = useRef(null);
    
    
    const navigate = useNavigate();

    const { t } = useTranslation();


    const [canvasSize, setCanvasSize] = useState({
            width: DESIGN_WIDTH, 
            height: DESIGN_HEIGHT, 
            scaleX: 1, 
            scaleY: 1
        });

    
    const goToNextLevel = () => {

        setLevelDone(false);
        
        navigate('/level3'); 
    };

    const goToPreviousLevel = () => {
        setLevelDone(false);

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
        { x: -20, y: -50, width: 20, height: 750 }, 
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
            const gameContainer = gameContainerRef.current;
            if (!gameContainer || !isFullScreen) {
                return;
            }
    
            const resizeObserver = new ResizeObserver(entries => {
                for (let entry of entries) {
                    const { width: containerWidth, height: containerHeight } = entry.contentRect;
    
                    // 1. Розраховуємо коефіцієнт масштабування по ширині
                    const scaleX = containerWidth / DESIGN_WIDTH;
                    // 2. Розраховуємо коефіцієнт масштабування по висоті
                    const scaleY = containerHeight / DESIGN_HEIGHT;
    
                    // 3. ОБИРАЄМО НАЙМЕНШИЙ коефіцієнт. Це гарантує, що canvas впишеться повністю.
                    const scale = Math.min(scaleX, scaleY);
    
                    // 4. Розраховуємо нові розміри canvas на основі цього єдиного коефіцієнта
                    const newCanvasWidth = DESIGN_WIDTH * scale;
                    const newCanvasHeight = DESIGN_HEIGHT * scale;
    
                    // 5. Оновлюємо стан. Зверніть увагу, scaleX і scaleY тепер однакові.
                    setCanvasSize({
                        width: newCanvasWidth,
                        height: newCanvasHeight,
                        scaleX: scale,
                        scaleY: scale,
                    });
                }
            });
            
            resizeObserver.observe(gameContainer);
            return () => resizeObserver.disconnect();
    
        }, [isFullScreen]);
    
        // Ефект для відстеження стану повноекранного режиму
         useEffect(() => {
            const handleFullScreenChange = () => {
                const isNowFullScreen = !!document.fullscreenElement;
                setIsFullScreen(isNowFullScreen);
    
                // ЯКЩО МИ ВИЙШЛИ з повноекранного режиму
                if (!isNowFullScreen) {
                    // Примусово повертаємо canvas до фіксованого розміру
                    setCanvasSize({
                        width: DESIGN_WIDTH,
                        height: DESIGN_HEIGHT,
                        scaleX: 1,
                        scaleY: 1,
                    });
                }
                // Якщо ми увійшли в повноекранний режим, то ResizeObserver сам встановить потрібний розмір.
            };
    
            document.addEventListener('fullscreenchange', handleFullScreenChange);
            return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
        }, []);
    
        // Функція для перемикання повноекранного режиму
        const toggleFullScreen = () => {
            if (!document.fullscreenElement) {
                gameContainerRef.current?.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
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
                    setGameOver(true); 
                    setGameOverMessage(t('level_page.player_perished', { playerType: player.playerType }));
                    setTimer(0);
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

            const { scaleX, scaleY } = canvasSize;
            const sX = (val) => val * scaleX;
            const sY = (val) => val * scaleY;
            const sAvg = (val) => val * Math.min(scaleX, scaleY);

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
        if (JSON.stringify(buttons) !== JSON.stringify(updatedButtons)) {
            setButtons(updatedButtons);
        }
        if (anyButtonPressed !== anyBtnPressedThisFrame) {
            setAnyButtonPressed(anyBtnPressedThisFrame);
        }

        // 2. Calculate New Moving Platform Positions
        const platformDeltas = {};
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

        // 3. Pre-Adjust Player Position on Moving Platforms
        [firePlayer.current, waterPlayer.current].forEach(player => {
            if (player.onGround && player.standingOnPlatformId) {
                const deltaY = platformDeltas[player.standingOnPlatformId];
                if (deltaY) {
                    player.y += deltaY;
                    if (deltaY < 0 && player.velY > 0.01) {
                        player.velY = 0;
                    }
                }
            }
        });
        
        // 4. Update React state for moving platforms
        if (JSON.stringify(movingPlatforms.map(mp => mp.currentY)) !== JSON.stringify(newCalculatedMovingPlatforms.map(mp => mp.currentY))) {
            setMovingPlatforms(newCalculatedMovingPlatforms);
        }

        // 5. Handle Player Movement & Collisions
        handleMovement(firePlayer, newCalculatedMovingPlatforms, staticPlatforms);
        handleMovement(waterPlayer, newCalculatedMovingPlatforms, staticPlatforms);

        // 6. Check if Players Died
        if (checkIfPlayerDied(firePlayer, staticPlatforms) || checkIfPlayerDied(waterPlayer, staticPlatforms)) {
             animationFrameId = requestAnimationFrame(loop);
             return;
        }

        // --- МАСШТАБУВАННЯ ТА МАЛЮВАННЯ (використовує sX, sY, sAvg) ---
        
        // Визначаємо хелпери для малювання на основі поточного розміру canvas
        

        // 7. Drawing
        ctx.clearRect(0, 0, canvas.width, canvas.height); // canvas.width/height вже масштабовані

        // Малюємо статичні платформи та ями
        staticPlatforms.forEach((plat) => {
            if (!plat.holeType) ctx.fillStyle = 'gray';
            else if (plat.holeType === 'fire') ctx.fillStyle = 'rgba(255, 68, 0, 0.5)';
            else if (plat.holeType === 'water') ctx.fillStyle = 'rgba(0, 8, 255, 0.5)';
            ctx.fillRect(sX(plat.x), sY(plat.y), sX(plat.width) + sY(1), sY(plat.height) + sY(1)); 
        });
        
        // Малюємо кнопки
        updatedButtons.forEach(btn => {
            ctx.fillStyle = btn.isPressed ? btn.pressedColor : btn.color;
            const buttonDrawY = btn.isPressed ? btn.originalY + btn.pressedYOffset : btn.originalY;
            const buttonDrawHeight = btn.height - (btn.isPressed ? btn.pressedYOffset : 0);
            ctx.fillRect(sX(btn.x), sY(buttonDrawY), sX(btn.width), sY(buttonDrawHeight));
        });
        
        // Малюємо рухомі платформи та їх індикатори
        newCalculatedMovingPlatforms.forEach(mp => {
            ctx.fillStyle = mp.color;
            ctx.fillRect(sX(mp.x), sY(mp.currentY), sX(mp.width), sY(mp.height));

            const lineThickness = sAvg(3); // Використовуємо sAvg для ліній
            const lineColor = anyButtonPressed ? 'rgb(255, 140, 0)' : 'rgb(255, 182, 93)';

            const unscaledLineWidth = mp.width * 0.5;
            const unscaledLineY = mp.currentY + (mp.height / 2);
            const unscaledLineStartX = mp.x + (mp.width - unscaledLineWidth) / 2;

            ctx.beginPath();
            ctx.moveTo(sX(unscaledLineStartX), sY(unscaledLineY));
            ctx.lineTo(sX(unscaledLineStartX + unscaledLineWidth), sY(unscaledLineY));
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = lineThickness;
            ctx.stroke();
        });

        // Малюємо фінішні зони
        finishZones.forEach((zone) => {
            ctx.fillStyle = zone.color;
            ctx.fillRect(sX(zone.x), sY(zone.y), sX(zone.width), sY(zone.height));
            
            ctx.lineWidth = sAvg(2); // Використовуємо sAvg для ліній
            if (zone.playerType === 'fire') {
                ctx.strokeStyle = 'rgb(255, 90, 30)';
            } else {
                 ctx.strokeStyle = 'rgb(0, 7, 212)';
            }
            ctx.strokeRect(sX(zone.x), sY(zone.y), sX(zone.width), sY(zone.height));
        });

        // Малюємо гравців
        [firePlayer.current, waterPlayer.current].forEach((p) => {
            ctx.fillStyle = p.color;
            ctx.fillRect(sX(p.x), sY(p.y), sX(p.width), sY(p.height));
        });

        // --- ЛОГІКА ЗАВЕРШЕННЯ РІВНЯ ---
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
        handleMovement, checkIfPlayerDied, keys, saveLevelProgress, calculateStars, timer, setNextLevelUnlocked]);

    return (
        <div className={styles.main} style={{ width: '100%', height: '100vh' }}>
            <div ref={gameContainerRef} className={styles.gameContainer}>
            <canvas ref={canvasRef} width={canvasSize.width} height={canvasSize.height}
                style={{ border: '1px solid black', display: 'block', margin: '0 auto',
                         backgroundImage: `url(${background})`, backgroundSize: 'cover' }} />
            <div className={styles.timerBadge}>
                <Link to='/'>
                <img src={house} alt="Home" className={styles.houseIcon} />
                </Link>
                <span className={styles.timer}>{formatTime(timer)} </span>
                <img src={reload} alt="Reload" className={styles.reloadIcon} onClick={resetGame} />
                {isFullScreen ? (
    <img 
        src={exitFullScreenIcon} 
        alt="Exit Fullscreen" 
        className={styles.fullscreenIcon} 
        onClick={toggleFullScreen} 
    />
) : (
    <img 
        src={fullScreenIcon} 
        alt="Enter Fullscreen" 
        className={styles.fullscreenIcon} 
        onClick={toggleFullScreen} 
    />
)}
            </div>


            {gameOver && ( <div style={{ backgroundImage: `url(${bgmodal})`, backgroundSize: 'cover', backgroundPosition: 'center top -20px',
                    width: '350px', height: '150px', textAlign: 'center', position: 'absolute',
                    top: '50%', left: '50%', transform: 'translate(-50%, -50%)', padding: '20px', borderRadius: '15px' }}>
                    <h2 className={styles.gameOver}>{t('level_page.game_over')}</h2> 
                    <p className={styles.gameOverMessage}>{gameOverMessage}</p>
                    <button onClick={resetGame} className={styles.playAgain}>{t('level_page.play_again')}</button> </div> )}


            {levelDone && ( 
                <div style={{ backgroundImage: `url(${bgmodal})`, backgroundSize: 'cover', backgroundPosition: 'center top -20px',
                    width: '350px', height: '150px', textAlign: 'center', position: 'absolute',
                    top: '50%', left: '50%', transform: 'translate(-50%, -50%)', padding: '20px', borderRadius: '15px' }}>
                    <h2 className={styles.lvlCompleted}>{t('level_page.level_completed')}</h2> 
                    <p className={styles.time}>{t('main_page.time', { time: formatTime(timer) })}</p>
                    <StarsDisplay count={stars} />
                    <button onClick={resetGame} className={styles.again}>{t('level_page.play_again')}</button> 
                    <button onClick={goToNextLevel} className={styles.nextLevel} disabled={!nextLevelUnlocked}>  &raquo; </button>
                    <button onClick={goToPreviousLevel} className={styles.previousLevel}> &laquo; </button>
                    </div> 
                  )}  

                    {/* {!nextLevelUnlocked && (
                        <p className={styles.unlockMessage}>
                            (Earn 2+ stars to unlock the next level)
                        </p>
                    )} */}
        </div>
    </div>
        
    );
};
export default TestLevel;