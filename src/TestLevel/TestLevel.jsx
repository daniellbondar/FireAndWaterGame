
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLevelData } from '../hooks/useLevelData';
import styles from './Level.module.css'; 
import background from '../images and icons/photo_2025-05-17_21-18-18-Picsart-AiImageEnhancer.jpg';
import bgmodal from '../images and icons/photo_2025-05-17_22-03-58.jpg';
import reloadIconImg from '../images and icons/Refresh.svg'; 
import houseIconImg from '../images and icons/Outline.svg'; 
import fullScreenIcon from '../images and icons/Full_alt.svg'
import exitFullScreenIcon from '../images and icons/Reduce.svg'


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
    const navigate = useNavigate();
    const [isFullScreen, setIsFullScreen] = useState(false);

    const gameContainerRef = useRef(null); // Ref для головного контейнера гри

    // ... ваші існуючі useState
    
    
    // Замініть ваш старий useState для canvasSize на цей
    const [canvasSize, setCanvasSize] = useState({
        width: DESIGN_WIDTH, 
        height: DESIGN_HEIGHT, 
        scaleX: 1, 
        scaleY: 1
    });
    

    
    const goToNextLevel = () => {
        
        navigate('/level2'); 
    };

    const gravity = 0.4; // Original gravity
    const jumpForce = -10; // Original jumpForce
    const speed = 4;     // Original speed

    // Static Platforms (including holes)
    const [staticPlatforms, setStaticPlatforms] = useState([
        { x: 0, y: 680, width: 313, height: 20 },
        { x: 412, y: 680, width: 100, height: 10 },
        { x: 612, y: 680, width: 100, height: 10 },
        { x: 812, y: 680, width: 300, height: 10 },
        { x: 300, y: 690, width: 940, height: 10 }, // Main ground
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

        { x: 450, y: 100, width: 140, height: 20, },
        { x: 450, y: 80, width: 100, height: 20 },
        { x: 450, y: 60, width: 60, height: 20 },
        { x: 285, y: 40, width: 190, height: 20 },
        { x: 355, y: 105, width: 45, height: 20 },
        { x: 150, y: 130, width: 80, height: 10 },
        { x: 150, y: 121, width: 80, height: 9, holeType: 'fire' },
        { x: 230, y: 110, width: 75, height: 10 },
        // Original ID 36 platform - { id: 36, x: 230, y: 120, width: 670, height: 20 }, (Removed ID as it's static)
        { x: 230, y: 120, width: 670, height: 20 },


        { x: 450, y: 300, width: 100, height: 20 },

        // Walls
        { x: 1100, y: 0, width: 20, height: 700 },
        { x: -20, y: 0, width: 20, height: 700 },
    ]);

    

    // Moving Platforms
    const initialMovingPlatforms = [
        {
            id: 40, // Original ID
            x: 285,
            initialY: 0, // The y-coordinate where it starts or resets to (one end of its range)
            currentY: 0, // Its current y-coordinate
            width: 20,
            height: 60,
            isMovingActive: false, // Equivalent to original 'activate'
            // 'directionIsDown' from original 'goingDown': true means moves towards range.to, false towards range.from
            directionIsDown: true, // As per original: `goingDown: true` (вниз)
            range: { from: 0, to: 60 }, // from: upper Y limit, to: lower Y limit
            speed: 1,
            color: 'gray' // Added color for drawing
        }
    ];
    const [movingPlatforms, setMovingPlatforms] = useState(initialMovingPlatforms);

    // Levers
    const initialLevers = [
        { // Верхній важіль
        id: 1,
        x: 70, y: 110,
        width: 25, height: 10,
        activated: false, // false = ручка в початковому нахилі, true = в протилежному
        initialTiltDirection: 'right', // Початково нахилений праворуч
        activatesPlatformId: 40,
        lastActivationTime: 0
    },
    { // Нижній важіль
        id: 2,
        x: 800, y: 220,
        width: 25, height: 10,
        activated: false,
        initialTiltDirection: 'left', // Початково нахилений ліворуч
        activatesPlatformId: 40,
        lastActivationTime: 0
    }

    ];
    const [levers, setLevers] = useState(initialLevers);

    const groundY = 700; // Based on canvas height and typical ground placement

    const formatTime = useCallback((time) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, []);



     useEffect(() => {
        const gameContainer = gameContainerRef.current;
        // Нічого не робимо, якщо немає контейнера або ми НЕ в повноекранному режимі
        if (!gameContainer || !isFullScreen) {
            return;
        }

        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const { width } = entry.contentRect;
                const scale = width / DESIGN_WIDTH;
                const newHeight = DESIGN_HEIGHT * scale;
                
                setCanvasSize({
                    width: width,
                    height: newHeight,
                    scaleX: width / DESIGN_WIDTH,
                    scaleY: newHeight / DESIGN_HEIGHT
                });
            }
        });
        
        // Спостерігаємо за контейнером, оскільки ми в повноекранному режимі
        resizeObserver.observe(gameContainer);

        // Функція очищення, яка відключить спостерігача при виході з повноекранного режиму
        return () => {
            resizeObserver.disconnect();
        };
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
        if (!levelDone && !gameOver) {
            timerInterval = setInterval(() => {
                setTimer((prev) => prev + 1);
            }, 1000);
        }
        return () => clearInterval(timerInterval);
    }, [levelDone, gameOver]);

    const calculateStars = useCallback((time) => {
        if (time <= 40) return 3;
        if (time > 40 && time <= 60) return 2;
        if (time > 60) return 1; // Original said > 80, not > 60 & <= 80
        
    }, []);

    const showModal = useCallback(() => {
        const earnedStars = calculateStars(timer);
        setStars(earnedStars);
    }, [timer, calculateStars]);


    useEffect(() => {
        if (levelDone) {
            const timeout = setTimeout(showModal, 500);
            return () => clearTimeout(timeout);
        }
    }, [levelDone, showModal]);


    const firePlayer = useRef({
        x: 100, 
        y: 600, 
        width: 40, 
        height: 40, 
        velY: 0, 
        playerType: 'fire', 
        onGround: false,
        standingOnPlatformId: null,
        color: 'rgb(255, 89, 29)', 
        controls: { left: 'a', right: 'd', jump: 'w' },
        cyrillic_controls: { left: 'ф', right: 'в', jump: 'ц' }
    });

    



    const waterPlayer = useRef({
        x: 200, 
        y: 590, 
        width: 40, 
        height: 40, 
        velY: 0, 
        playerType: 'water', 
        onGround: false,
        standingOnPlatformId: null, 
        color: 'rgb(0, 7, 212)',
        controls: { left: 'ArrowLeft', right: 'ArrowRight', jump: 'ArrowUp' }
    });

    const resetGame = useCallback(() => {
        setLevelDone(false);
        setTimer(0);
        setStars(0);
        setGameOver(false);
        setGameOverMessage("");

        firePlayer.current.x = 100;
        firePlayer.current.y = 600;
        firePlayer.current.velY = 0;
        firePlayer.current.onGround = false;
        firePlayer.current.standingOnPlatformId = null;

        waterPlayer.current.x = 200;
        waterPlayer.current.y = 590;
        waterPlayer.current.velY = 0;
        waterPlayer.current.onGround = false;
        waterPlayer.current.standingOnPlatformId = null;
        
        setLevers(initialLevers.map(l => ({...l, activated: false}))); // Reset levers
        setMovingPlatforms(initialMovingPlatforms.map(mp => ({ // Reset moving platforms
            ...mp, 
            currentY: mp.initialY, 
            isMovingActive: false,
            // directionIsDown: true // Or its original initial direction if different per platform
        })));

    }, []); // Removed initialLevers, initialMovingPlatforms from deps, they are stable if defined outside


    const finishZones = [
        { x: 310, y: 70, width: 40, height: 50, color: 'gray', playerType: 'fire' },
        { x: 405, y: 70, width: 40, height: 50, color: 'gray', playerType: 'water' }



    ];


    





    const hasReachedFinish = (player, zone) => (
        player.x < zone.x + zone.width &&
        player.x + player.width > zone.x &&
        player.y < zone.y + zone.height &&
        player.y + player.height > zone.y &&
        player.playerType === zone.playerType
    );

    const activateLeveredPlatform = useCallback((platformIdToActivate, leverIdToToggle) => {
        setMovingPlatforms(prevMovingPlats =>
            prevMovingPlats.map(plat => {
                if (plat.id === platformIdToActivate) {
                    return {
                        ...plat,
                        isMovingActive: true, // Start movement
                        directionIsDown: !plat.directionIsDown // Toggle its inherent direction for this movement cycle
                    };
                }
                return plat;
            })
        );
        setLevers(prevLevers =>
            prevLevers.map(lever =>
                lever.id === leverIdToToggle
                    ? { ...lever, activated: !lever.activated } // Toggle visual state of the lever
                    : lever
            )
        );
    }, [setMovingPlatforms, setLevers]); // Dependencies

    const handlePlayerPushLever = useCallback((playerRef) => {

        const leverCooldownMs = 5000;

        const player = playerRef.current;
        const currentTime = Date.now()


        setLevers(prevLevers => {
        let stateActuallyChanged = false; // Прапорець, чи дійсно щось змінилося

        const updatedLevers = prevLevers.map(lever => {
            const playerRect = { x: player.x, y: player.y, width: player.width, height: player.height };
            const leverRect = { x: lever.x, y: lever.y, width: lever.width, height: lever.height };

            if (
                playerRect.x < leverRect.x + leverRect.width &&
                playerRect.x + playerRect.width > leverRect.x &&
                playerRect.y < leverRect.y + leverRect.height &&
                playerRect.y + playerRect.height > leverRect.y
            ) {
                // Перевірка Cooldown
                if (currentTime - lever.lastActivationTime < leverCooldownMs) {
                    return lever; // Нічого не робимо, cooldown
                }

                // Якщо дійшли сюди, cooldown минув і є колізія.
                // Тепер важливо: ми ОДРАЗУ викликаємо setMovingPlatforms.
                // І одразу ж оновлюємо стан важеля.

                
setMovingPlatforms(prevMovingPlats =>
    prevMovingPlats.map(plat => {
        if (plat.id === lever.activatesPlatformId) {
            let newDirectionIsDown = !plat.directionIsDown;
            
            // ЯКЩО ЦЕ ПЕРША АКТИВАЦІЯ ПІСЛЯ ТОГО, ЯК ПЛАТФОРМА БУЛА НЕАКТИВНА
            // І ВОНА ЗНАХОДИТЬСЯ НА ОДНІЙ З МЕЖ
            if (!plat.isMovingActive) { // Якщо платформа була неактивна
                if (plat.currentY <= plat.range.from && !newDirectionIsDown) {
                    // Платформа на верхній межі, і новий напрямок теж вгору -> примусово вниз
                    console.log(`Platform ${plat.id} was at top, forcing down.`);
                    newDirectionIsDown = true;
                } else if (plat.currentY >= plat.range.to && newDirectionIsDown) {
                    // Платформа на нижній межі, і новий напрямок теж вниз -> примусово вгору
                    console.log(`Platform ${plat.id} was at bottom, forcing up.`);
                    newDirectionIsDown = false;
                }
            }

            console.log(`Activating platform ${plat.id}. Old direction: ${plat.directionIsDown}. New direction: ${newDirectionIsDown}.`);
            return {
                ...plat,
                isMovingActive: true,
                directionIsDown: newDirectionIsDown
            };
        }
        return plat;
    })
);
                
                stateActuallyChanged = true; // Позначаємо, що стан змінився
                return {
                    ...lever,
                    activated: !lever.activated, // Переключаємо стан важеля
                    lastActivationTime: currentTime
                };
            }
            return lever; // Повертаємо важіль без змін, якщо не було колізії або cooldown
        });

        // Повертаємо оновлений масив ТІЛЬКИ якщо щось дійсно змінилося,
        // щоб уникнути зайвих ре-рендерів.
        if (stateActuallyChanged) {
            return updatedLevers;
        }
        return prevLevers; // Повертаємо старий масив, якщо нічого не змінилося
    });
}, [setLevers, setMovingPlatforms]);



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
            player.standingOnPlatformId = null;
        }

        player.velY += gravity;
        player.y += player.velY;
        player.onGround = false;

        const allPlatformsForCollision = [
            
            ...currentStaticPlatforms.filter(p => !p.holeType), // Solid static platforms
            ...currentFrameMovingPlatforms.map(mp => ({
                id: mp.id, x: mp.x, y: mp.currentY, width: mp.width, height: mp.height, isMoving: true
            }))
        ];

        
        let landedOnMovingThisFrameId = null;
        let landedOnStaticThisFrame = false;

        allPlatformsForCollision.forEach((plat) => {
            const wasPlayerFeetAboveOrAtPlatTop = prevY + player.height <= plat.y + 1;
            const isPlayerFallingOrStationary = player.velY >= -0.01; 
            const isPlayerFeetCurrentlyOnPlat = player.y + player.height >= plat.y && player.y + player.height <= plat.y + plat.height + Math.abs(player.velY) + 1; // Increased tolerance based on velocity
            const isPlayerHorizontallyAligned = player.x + player.width > plat.x && player.x < plat.x + plat.width;

            if (wasPlayerFeetAboveOrAtPlatTop && isPlayerFallingOrStationary && isPlayerFeetCurrentlyOnPlat && isPlayerHorizontallyAligned) {
                player.y = plat.y - player.height;
                player.velY = 0;
                player.onGround = true;
                if (plat.isMoving) landedOnMovingThisFrameId = plat.id;
                else landedOnStaticThisFrame = true;
            }

            const wasPlayerHeadBelowOrAtPlatBottom = prevY >= plat.y + plat.height -1;
            const isPlayerMovingUp = player.velY < 0;
            const isPlayerHeadCurrentlyHittingPlat = player.y <= plat.y + plat.height && player.y >= plat.y;
             if (wasPlayerHeadBelowOrAtPlatBottom && isPlayerMovingUp && isPlayerHeadCurrentlyHittingPlat && isPlayerHorizontallyAligned) {
                player.y = plat.y + plat.height;
                player.velY = 0;
            }
            
            const isPlayerVerticallyWithinPlat = player.y + player.height > plat.y + 1 && player.y < plat.y + plat.height -1; // +1 / -1 to avoid re-triggering from landing logic
            if (isPlayerVerticallyWithinPlat) {
                 const wasPlayerLeftOfPlat = prevX + player.width <= plat.x + 1; // Small tolerance
                 const wasPlayerRightOfPlat = prevX >= plat.x + plat.width -1; // Small tolerance
                 const isCurrentlyCollidingHorizontally = player.x + player.width > plat.x && player.x < plat.x + plat.width;

                 if (wasPlayerLeftOfPlat && isCurrentlyCollidingHorizontally) {
                    player.x = plat.x - player.width;
                 }
                 if (wasPlayerRightOfPlat && isCurrentlyCollidingHorizontally) {
                    player.x = plat.x + plat.width;
                 }
            }
        });
        
        if (landedOnMovingThisFrameId) player.standingOnPlatformId = landedOnMovingThisFrameId;
        else if (landedOnStaticThisFrame) player.standingOnPlatformId = null;
        else if (!player.onGround) player.standingOnPlatformId = null;

        // Collision with canvas bottom (groundY)
        const mainGroundPlatform = currentStaticPlatforms.find(p => p.y === 690 && p.width === 940); // Example of finding the main ground
        const effectiveGroundY = mainGroundPlatform ? mainGroundPlatform.y : groundY;

        


        if (player.y + player.height > effectiveGroundY) {
             // Check if player is over a hole in the main ground
            let onHole = false;
            currentStaticPlatforms.forEach(plat => {
                if (plat.holeType && plat.y + plat.height >= effectiveGroundY) { // Check holes at ground level
                     if (player.x < plat.x + plat.width && player.x + player.width > plat.x) {
                        onHole = true;
                     }
                }
            });

            if (!onHole) {
                player.y = effectiveGroundY - player.height;
                player.velY = 0;
                player.onGround = true;
                player.standingOnPlatformId = null;
            }
        }

        


    }, [keys, gravity, jumpForce, speed, groundY]); // groundY might need to be dynamic if level changes

    const checkIfPlayerDied = useCallback((playerRef, currentAllPlatforms) => {
        const player = playerRef.current;
        for (let plat of currentAllPlatforms) { // Check against all platforms that might be holes
            if (plat.holeType && plat.holeType !== player.playerType) {
                if (player.x < plat.x + plat.width && player.x + player.width > plat.x &&
                    player.y < plat.y + plat.height && player.y + player.height > plat.y) {
                    setGameOver(true); 
                    setGameOverMessage(`Player ${player.playerType} perished!`);
                    setTimer(0); // Reset timer on death as per original
                    return true;
                }
            }
        }
        // Check if fallen off bottom of canvas
        if (player.y > canvasRef.current?.height + player.height) {
             setGameOver(true); 
             setGameOverMessage(`Player ${player.playerType} fell off!`);
             setTimer(0);
             return true;
        }
        return false;
    }, [setGameOver, setGameOverMessage, setTimer]); // Added setTimer dependency

    useEffect(() => {
        const handleKeyDown = (e) => {
            const keyToStore = e.key.length === 1 ? e.key.toLowerCase() : e.key;
            setKeys((prevKeys) => ({ ...prevKeys, [keyToStore]: true }));
        };
        const handleKeyUp = (e) => {
            const keyToStore = e.key.length === 1 ? e.key.toLowerCase() : e.key;
            setKeys((prevKeys) => ({ ...prevKeys, [keyToStore]: false }));
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        let animationFrameId;
        const loop = () => {
            if (gameOver || levelDone) {
                // If the game is over or done, we stop updating logic but keep the loop running to not clear the canvas.
                // However, if we want to show a modal, we should stop the loop entirely. Let's adjust this.
                // The state change will stop the loop correctly in the useEffect dependencies.
                // We'll just make sure not to request a new frame if we're done.
                return;
            }
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            if (!ctx) {
                animationFrameId = requestAnimationFrame(loop); return;
            }

            // --- ADAPTATION HELPERS ---
            const { scaleX, scaleY } = canvasSize;
            const sX = (val) => val * scaleX;
            const sY = (val) => val * scaleY;
            const sAvg = (val) => val * Math.min(scaleX, scaleY);

            // --- LOGIC (UNCHANGED, USES ORIGINAL COORDINATES) ---
            // 1. Handle Player-Lever Interaction
            handlePlayerPushLever(firePlayer);
            handlePlayerPushLever(waterPlayer);

            // 2. Calculate New Moving Platform Positions
            const platformDeltas = {};
            const newCalculatedMovingPlatforms = movingPlatforms.map(mp => {
                let updatedMp = { ...mp };
                if (mp.isMovingActive) {
                    const prevPlatformY = mp.currentY;
                    let nextPlatformY = mp.currentY;
                    let stillActive = true;
                    if (mp.directionIsDown) {
                        nextPlatformY += mp.speed;
                        if (nextPlatformY >= mp.range.to) { nextPlatformY = mp.range.to; stillActive = false; }
                    } else {
                        nextPlatformY -= mp.speed;
                        if (nextPlatformY <= mp.range.from) { nextPlatformY = mp.range.from; stillActive = false; }
                    }
                    updatedMp.currentY = nextPlatformY;
                    updatedMp.isMovingActive = stillActive;
                    if (prevPlatformY !== nextPlatformY) platformDeltas[mp.id] = nextPlatformY - prevPlatformY;
                }
                return updatedMp;
            });
            
            // 3. Pre-Adjust Player Position on Moving Platforms
            [firePlayer.current, waterPlayer.current].forEach(player => {
                if (player.onGround && player.standingOnPlatformId) {
                    const deltaY = platformDeltas[player.standingOnPlatformId];
                    if (deltaY) { player.y += deltaY; if (deltaY < 0 && player.velY > 0.01) player.velY = 0; }
                }
            });

            // 4. Update React state for moving platforms
            if (JSON.stringify(movingPlatforms) !== JSON.stringify(newCalculatedMovingPlatforms)) {
                setMovingPlatforms(newCalculatedMovingPlatforms);
            }
            
            // 5. Handle Player Movement & Collisions
            const allPlatformsForDeathCheck = [...staticPlatforms, ...newCalculatedMovingPlatforms.map(mp => ({...mp, y: mp.currentY}))];
            handleMovement(firePlayer, newCalculatedMovingPlatforms, staticPlatforms);
            handleMovement(waterPlayer, newCalculatedMovingPlatforms, staticPlatforms);

            // 6. Check if Players Died
            if (checkIfPlayerDied(firePlayer, allPlatformsForDeathCheck) || checkIfPlayerDied(waterPlayer, allPlatformsForDeathCheck)) {
                // State change will handle the loop stop
            }

            // --- DRAWING (MODIFIED TO USE SCALING) ---
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Static Platforms & Holes
            staticPlatforms.forEach((plat) => {
                if (!plat.holeType) ctx.fillStyle = 'gray';
                else if (plat.holeType === 'fire') ctx.fillStyle = 'rgba(255, 68, 0, 0.5)';
                else if (plat.holeType === 'water') ctx.fillStyle = 'rgba(0, 8, 255, 0.5)';
                ctx.fillRect(sX(plat.x), sY(plat.y), sX(plat.width), sY(plat.height) + 1); // +1 to fix gaps
            });

            // Moving Platforms
            newCalculatedMovingPlatforms.forEach(mp => {
                ctx.fillStyle = mp.color;
                ctx.fillRect(sX(mp.x), sY(mp.currentY), sX(mp.width), sY(mp.height) + 1); // +1 to fix gaps

                const lineHeight = sY(mp.height * 0.5);
                const lineThickness = sAvg(3);
                const lineX = sX(mp.x + mp.width / 2);
                const lineStartY = sY(mp.currentY + (mp.height - (mp.height * 0.5)) / 3);
                const lineEndY = lineStartY + lineHeight;
                
                let lineColor = mp.isMovingActive ? 'rgb(255, 140, 0)' : 'rgb(255, 182, 93)';
                
                ctx.beginPath();
                ctx.moveTo(lineX, lineStartY);
                ctx.lineTo(lineX, lineEndY);
                ctx.strokeStyle = lineColor;
                ctx.lineWidth = lineThickness;
                ctx.lineCap = 'butt';
                ctx.stroke();
            });
            
            // Levers
            levers.forEach((lever) => {
                const housingPadding = sAvg(3);
                ctx.fillStyle = 'rgba(255, 182, 93, 0.7)';
                ctx.shadowBlur = sAvg(3);
                ctx.beginPath();
                ctx.roundRect(
                    sX(lever.x) - housingPadding,
                    sY(lever.y) - housingPadding,
                    sX(lever.width) + 2 * housingPadding,
                    sY(lever.height) + 2 * housingPadding,
                    sAvg(4)
                );
                ctx.fill();
                ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
                ctx.shadowBlur = sAvg(3); ctx.shadowOffsetX = sAvg(1); ctx.shadowOffsetY = sAvg(1);
                ctx.fill();
                ctx.shadowColor = 'transparent';

                ctx.fillStyle = '#455A64';
                ctx.fillRect(sX(lever.x), sY(lever.y), sX(lever.width), sY(lever.height));
                
                const handleBaseThickness = sAvg(4);
                const handleTipThickness = sAvg(3);
                const knobRadius = sAvg(5);
                const handleLength = sY(lever.height * 2.5);

                const pivotX = sX(lever.x + lever.width / 2);
                const pivotY = sY(lever.y + lever.height * 0.65);

                const angleDegrees = 30;
                const angleRadians = angleDegrees * (Math.PI / 180);
                const verticalUpAngle = -Math.PI / 2;
                let currentAngle;

                if (!lever.activated) {
                    currentAngle = verticalUpAngle + (lever.initialTiltDirection === 'right' ? angleRadians : -angleRadians);
                } else {
                    currentAngle = verticalUpAngle + (lever.initialTiltDirection === 'right' ? -angleRadians : angleRadians);
                }
                
                const endX = pivotX + handleLength * Math.cos(currentAngle);
                const endY = pivotY + handleLength * Math.sin(currentAngle);

                ctx.beginPath();
                ctx.moveTo(pivotX - handleBaseThickness / 2 * Math.sin(currentAngle), pivotY + handleBaseThickness / 2 * Math.cos(currentAngle));
                ctx.lineTo(endX - handleTipThickness / 2 * Math.sin(currentAngle), endY + handleTipThickness / 2 * Math.cos(currentAngle));
                ctx.lineTo(endX + handleTipThickness / 2 * Math.sin(currentAngle), endY - handleTipThickness / 2 * Math.cos(currentAngle));
                ctx.lineTo(pivotX + handleBaseThickness / 2 * Math.sin(currentAngle), pivotY - handleBaseThickness / 2 * Math.cos(currentAngle));
                ctx.closePath();
                
                ctx.fillStyle = 'rgb(56, 74, 82)';
                ctx.fill();

                ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
                ctx.shadowBlur = sAvg(2); ctx.shadowOffsetX = sAvg(1); ctx.shadowOffsetY = sAvg(1);
                ctx.fill();
                ctx.shadowColor = 'transparent';

                ctx.beginPath();
                ctx.arc(endX, endY, knobRadius, 0, 2 * Math.PI);
                ctx.fillStyle = lever.activated ? '#66BB6A' : '#EF5350';
                ctx.fill();

                ctx.beginPath();
                ctx.arc(endX - knobRadius * 0.3, endY - knobRadius * 0.3, knobRadius * 0.5, 0, 2 * Math.PI);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                ctx.fill();
            });

            // Finish Zones
            finishZones.forEach((zone) => {
                ctx.fillStyle = zone.color; 
                ctx.fillRect(sX(zone.x), sY(zone.y), sX(zone.width), sY(zone.height));
                ctx.lineWidth = sAvg(2);
                if (zone.playerType === 'fire') {
                    ctx.strokeStyle = 'rgb(255, 90, 30)';
                } else {
                    ctx.strokeStyle = 'rgb(0, 7, 212)';
                }
                ctx.strokeRect(sX(zone.x), sY(zone.y), sX(zone.width), sY(zone.height));
            });

            // Players
            [firePlayer.current, waterPlayer.current].forEach((p) => {
                ctx.fillStyle = p.color; 
                ctx.fillRect(sX(p.x), sY(p.y), sX(p.width), sY(p.height));
            });
            
            // Win condition
            const fireDone = hasReachedFinish(firePlayer.current, finishZones.find(z => z.playerType === 'fire'));
            const waterDone = hasReachedFinish(waterPlayer.current, finishZones.find(z => z.playerType === 'water'));
            if (fireDone && waterDone && !levelDone && !gameOver) {
                const earnedStars = calculateStars(timer);
                setStars(earnedStars);
                saveLevelProgress('level1', timer, earnedStars); 
                setLevelDone(true); 
            }
                
            animationFrameId = requestAnimationFrame(loop);
        };
        loop();
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            cancelAnimationFrame(animationFrameId);
        };
    }, [
        gameOver, levelDone, staticPlatforms, movingPlatforms, levers, keys, // Core state and interaction
        handleMovement, checkIfPlayerDied, handlePlayerPushLever, activateLeveredPlatform, saveLevelProgress, calculateStars, timer]);


    return (
        <div className={styles.main} style={{ width: '100%', height: '100vh' }}>
            <div ref={gameContainerRef} className={styles.gameContainer}>
            <canvas ref={canvasRef} width={canvasSize.width} height={canvasSize.height}
                style={{
                    border: '1px solid black', display: 'block', margin: '0 auto',
                    backgroundImage: `url(${background})`, backgroundSize: 'cover'
                }} />
            <div className={styles.timerBadge}>

                <Link to='/'>
                <img src={houseIconImg} alt="Home" className={styles.houseIcon} />
                </Link>
                 {/* Use imported image names */}
                <span className={styles.timer}>{formatTime(timer)} </span>
                <img src={reloadIconImg} alt="Reload" className={styles.reloadIcon} onClick={resetGame} />
                {isFullScreen ? (
    // Якщо ми ВЖЕ в повноекранному режимі, показуємо іконку "Вийти"
    <img 
        src={exitFullScreenIcon} 
        alt="Exit Fullscreen" 
        className={styles.fullscreenIcon} 
        onClick={toggleFullScreen} 
    />
) : (
    // Якщо ми НЕ в повноекранному режимі, показуємо іконку "Увійти"
    <img 
        src={fullScreenIcon} 
        alt="Enter Fullscreen" 
        className={styles.fullscreenIcon} 
        onClick={toggleFullScreen} 
    />
)}
            </div>

            {/* Removed direct rendering of platforms/finish zones as divs, canvas handles it */}

            {gameOver && (
                <div style={{
                    backgroundImage: `url(${bgmodal})`, backgroundSize: 'cover', backgroundPosition: 'center top -20px',
                    width: '350px', height: '150px', textAlign: 'center', position: 'absolute',
                    top: '50%', left: '50%', transform: 'translate(-50%, -50%)', padding: '20px', borderRadius: '15px'
                }}>
                    <h2 className={styles.gameOver}>Game over</h2>
                    <p className={styles.gameOverMessage}>{gameOverMessage}</p>
                    <button onClick={resetGame} className={styles.playAgain}>Play again</button>
                </div>
            )}

            {levelDone && (
                <div style={{
                    backgroundImage: `url(${bgmodal})`, backgroundSize: 'cover', backgroundPosition: 'center top -20px',
                    width: '350px', height: '150px', textAlign: 'center', position: 'absolute',
                    top: '50%', left: '50%', transform: 'translate(-50%, -50%)', padding: '20px', borderRadius: '15px'
                }}>
                    <h2 className={styles.lvlCompleted}>Level Completed!</h2>
                    <p className={styles.time}>Time: {formatTime(timer)}</p>
                    <StarsDisplay count={stars} />
                    <button onClick={resetGame} className={styles.again}>Play again</button>
                    <button onClick={goToNextLevel} className={styles.nextLevel} disabled={!nextLevelUnlocked}>  &raquo; </button>
                </div>
                
            )}
        </div>
    </div>
    );
};

export default TestLevel;