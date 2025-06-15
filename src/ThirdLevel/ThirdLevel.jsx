import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLevelData } from '../hooks/useLevelData';
import { useTranslation } from 'react-i18next';
import styles from './ThirdLevel.module.css';
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


export const ThirdLevel = () => {
    const canvasRef = useRef(null);
    const [keys, setKeys] = useState({});
    const [timer, setTimer] = useState(0);
    const [levelDone, setLevelDone] = useState(false);
    const [stars, setStars] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [gameOverMessage, setGameOverMessage] = useState("");
    const { saveLevelProgress } = useLevelData();
    const [isFullScreen, setIsFullScreen] = useState(false);
    const gameContainerRef = useRef(null);
    const { t } = useTranslation();


    const [canvasSize, setCanvasSize] = useState({
            width: DESIGN_WIDTH, 
            height: DESIGN_HEIGHT, 
            scaleX: 1, 
            scaleY: 1
        });
    
    
    const navigate = useNavigate();

    const goToPreviousLevel = () => {
        setLevelDone(false);

        navigate('/level1')
    }

    const gravity = 0.4;
    const jumpForce = -10;
    const speed = 4; // Швидкість гравця

    // Static Platforms
    const [staticPlatforms, setStaticPlatforms] = useState([
        {x: 0, y: 690, width: 1100, height: 10},
        {x: 0, y: 680, width: 250, height: 10},
        {x: 250, y: 680, width: 400, height: 10, holeType: 'water'},
        {x: 300, y: 650, width: 50, height: 20},
        {x: 430, y: 650, width: 50, height: 20},
        {x: 560, y: 650, width: 50, height: 20},
        {x: 650, y: 680, width: 250, height: 10},
        {x: 1095, y: 680, width: 5, height: 10},
        {x: 900, y: 680, width: 195, height: 10, holeType: 'fire'},

        {x: 0, y: 550, width: 700, height: 10},
        {x: 0, y: 540, width: 5, height: 20, },
        {x: 5, y: 540, width: 295, height: 10, holeType: 'water'},
        {x: 300, y: 540, width: 150, height: 10},
        {x: 600, y: 540, width: 100, height: 10},
        {x: 450, y: 540, width: 150, height: 10, holeType: 'fire'},
        {x: 150, y: 490, width: 70, height: 20},

        {x: 140, y: 390, width: 100, height: 20},
        {x: 240, y: 400, width: 200, height: 10},
        {x: 240, y: 390, width: 200, height: 10, holeType: 'water'},
        {x: 440, y: 390, width: 100, height: 20},
        {x: 290, y: 350, width: 50, height: 20},

        {x: 0, y: 300, width: 200, height: 10},
        {x: 0, y: 290, width: 5, height: 10},
        {x: 5, y: 290, width: 105, height: 10, holeType: 'fire'},
        {x: 110, y: 290, width: 90, height: 10},
        {x: 330, y: 200, width: 210, height: 20},
        {x: 150, y: 100, width: 200, height: 20},
        {x: 30, y: 200, width: 100, height: 20},
        {x: 100, y: 150, width: 100, height: 20},

        {x: 540, y: 0, width: 20, height: 410},

        {x: 560, y: 400, width: 400, height: 10},
        {x: 560, y: 390, width: 100, height: 20},
        {x: 660, y: 390, width: 200, height: 10, holeType: 'fire'},
        {x: 740, y: 350, width: 50, height: 20},
        {x: 860, y: 390, width: 100, height: 20},
        {x: 1000, y: 300, width: 100, height: 20},
        {x: 800, y: 270, width: 100, height: 20},

        {x: 720, y: 90, width: 410, height: 20},
        {x: 880, y: 50, width: 20, height: 40},
        {x: 950, y: 0, width: 20, height: 40},

        {x: 0, y: -20, width: 1100, height: 20},
        {x: -20, y: 0, width: 20, height: 800},
        {x: 1100, y: 0, width: 20, height: 800},
    ]);

    // Moving Platforms
    const initialMovingPlatforms = [
        { id: 'verticalPlatform', x: 600, initialY: 220, currentY: 220, width: 80, height: 20, isMovingActive: false, directionIsDown: true, yRange: { from: 90, to: 220 }, speed: 0.4, color: 'gray', movementType: 'vertical' },
        { id: 'horizontalPlatform', initialX: 200, currentX: 200, y: 520, width: 80, height: 20, isMovingActive: false, directionIsRight: true, xRange: { from: 10, to: 200 }, speed: 0.7, color: 'gray', movementType: 'horizontal' }
    ];
    const [movingPlatforms, setMovingPlatforms] = useState(initialMovingPlatforms);

    // Levers
    const initialLevers = [
        { id: 1, x: 230, y: 90, width: 25, height: 10, activated: false, initialTiltDirection: 'right', activatesPlatformId: 'verticalPlatform', lastActivationTime: 0 },
        { id: 2, x: 1020, y: 80, width: 25, height: 10, activated: false, initialTiltDirection: 'left', activatesPlatformId: 'horizontalPlatform', lastActivationTime: 0 }
    ];
    const [levers, setLevers] = useState(initialLevers);

    const formatTime = useCallback((time) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, []);

    // FIX: Додано ефект, який скидає гру при зміні стану повноекранного режиму.
    // Це забезпечує правильне початкове положення гравців.
    useEffect(() => {
        resetGame();
    }, [isFullScreen]);

    useEffect(() => {
        const gameContainer = gameContainerRef.current;
        if (!gameContainer) return;

        const resizeObserver = new ResizeObserver(entries => {
            if (!document.fullscreenElement) return;

            for (let entry of entries) {
                const { width: containerWidth, height: containerHeight } = entry.contentRect;
                const scaleX = containerWidth / DESIGN_WIDTH;
                const scaleY = containerHeight / DESIGN_HEIGHT;
                const scale = Math.min(scaleX, scaleY);
                const newCanvasWidth = DESIGN_WIDTH * scale;
                const newCanvasHeight = DESIGN_HEIGHT * scale;
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
    }, []);

     useEffect(() => {
        const handleFullScreenChange = () => {
            const isNowFullScreen = !!document.fullscreenElement;
            setIsFullScreen(isNowFullScreen);
            if (!isNowFullScreen) {
                setCanvasSize({
                    width: DESIGN_WIDTH,
                    height: DESIGN_HEIGHT,
                    scaleX: 1,
                    scaleY: 1,
                });
            }
        };
        document.addEventListener('fullscreenchange', handleFullScreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
    }, []);

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
        if (time <= 25) return 3;
        if (time <= 35) return 2;
        return 1;
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
        x: 470, y: 250, width: 40, height: 40, velY: 0, playerType: 'fire', onGround: false,
        standingOnPlatformId: null, color: 'rgb(255, 89, 29)',
        controls: { left: 'a', right: 'd', jump: 'w' },
        cyrillic_controls: { left: 'ф', right: 'в', jump: 'ц' }
    });

    const waterPlayer = useRef({
        x: 590, y: 250, width: 40, height: 40, velY: 0, playerType: 'water', onGround: false,
        standingOnPlatformId: null, color: 'rgb(0, 7, 212)',
        controls: { left: 'ArrowLeft', right: 'ArrowRight', jump: 'ArrowUp' }
    });

    // FIX: Спрощено `resetGame` для надійності, залежності видалено, оскільки вони константні.
    const resetGame = useCallback(() => {
        setLevelDone(false);
        setTimer(0);
        setStars(0);
        setGameOver(false);
        setGameOverMessage("");
        firePlayer.current = { ...firePlayer.current, x: 470, y: 250, velY: 0, onGround: false, standingOnPlatformId: null };
        waterPlayer.current = { ...waterPlayer.current, x: 590, y: 250, velY: 0, onGround: false, standingOnPlatformId: null };
        setLevers(initialLevers.map(l => ({ ...l, activated: false, lastActivationTime: 0 })));
        setMovingPlatforms(initialMovingPlatforms.map(p => ({
            ...p,
            currentY: p.initialY,
            currentX: p.initialX,
            isMovingActive: false,
            directionIsDown: true,
            directionIsRight: true,
        })));
    }, []);

    const finishZones = [
        { x: 30, y: 630, width: 40, height: 50, color: 'gray', playerType: 'fire' },
        { x: 780, y: 40, width: 40, height: 50, color: 'gray', playerType: 'water' }
    ];

    const hasReachedFinish = (player, zone) => (
        player.x < zone.x + zone.width &&
        player.x + player.width > zone.x &&
        player.y < zone.y + zone.height &&
        player.y + player.height > zone.y &&
        player.playerType === zone.playerType
    );
    
    const handlePlayerPushLever = useCallback((playerRef) => {
        const leverCooldownMs = 5000;
        const player = playerRef.current;
        const currentTime = Date.now();

        setLevers(prevLevers => {
            let stateActuallyChanged = false;
            const updatedLevers = prevLevers.map(lever => {
                if (
                    player.x < lever.x + lever.width &&
                    player.x + player.width > lever.x &&
                    player.y < lever.y + lever.height &&
                    player.y + player.height > lever.y
                ) {
                    if (currentTime - lever.lastActivationTime < leverCooldownMs) {
                        return lever;
                    }
                    setMovingPlatforms(prevMovingPlats =>
                        prevMovingPlats.map(plat => {
                            if (plat.id === lever.activatesPlatformId) {
                                if (plat.movementType === 'vertical') {
                                    return { ...plat, isMovingActive: true, directionIsDown: !plat.directionIsDown };
                                } else if (plat.movementType === 'horizontal') {
                                    return { ...plat, isMovingActive: true, directionIsRight: !plat.directionIsRight };
                                }
                            }
                            return plat;
                        })
                    );
                    stateActuallyChanged = true;
                    return { ...lever, activated: !lever.activated, lastActivationTime: currentTime };
                }
                return lever;
            });
            return stateActuallyChanged ? updatedLevers : prevLevers;
        });
    }, [setLevers, setMovingPlatforms]);

    // FIX: Логіка руху тепер працює ТІЛЬКИ з логічними координатами. Без sX/sY.
    const handleMovement = useCallback((playerRef, currentFrameMovingPlatforms, currentStaticPlatforms) => {
        const player = playerRef.current;
        const controls = player.controls;
        const cyrillic_controls = player.cyrillic_controls || {};

        const prevPlayerY = player.y;
        const prevPlayerX = player.x;

        const moveLeft = keys[controls.left] || (player.playerType === 'fire' && keys[cyrillic_controls.left]);
        const moveRight = keys[controls.right] || (player.playerType === 'fire' && keys[cyrillic_controls.right]);
        const doJump = keys[controls.jump] || (player.playerType === 'fire' && keys[cyrillic_controls.jump]);

        if (moveLeft) player.x -= speed;
        if (moveRight) player.x += speed;

        if (doJump && player.onGround) {
            player.velY = jumpForce;
            player.onGround = false;
            player.standingOnPlatformId = null;
        }

        player.velY += gravity;
        player.y += player.velY;

        const allPlatformsForCollision = [
            ...currentStaticPlatforms.filter(p => !p.holeType),
            ...currentFrameMovingPlatforms.map(mp => ({
                id: mp.id,
                x: mp.movementType === 'horizontal' ? mp.currentX : mp.x,
                y: mp.movementType === 'vertical' ? mp.currentY : mp.y,
                width: mp.width,
                height: mp.height,
                isMoving: true
            }))
        ];

        let landedOnPlatformThisFrame = false;
        player.onGround = false;

        allPlatformsForCollision.forEach((plat) => {
            const playerBottom = player.y + player.height;
            const playerRight = player.x + player.width;
            const platBottom = plat.y + plat.height;

            if (prevPlayerY + player.height <= plat.y + 1 &&
                playerBottom >= plat.y && playerBottom <= platBottom &&
                playerRight > plat.x && player.x < plat.x + plat.width) {
                player.y = plat.y - player.height;
                player.velY = 0;
                player.onGround = true;
                landedOnPlatformThisFrame = true;
                player.standingOnPlatformId = plat.isMoving ? plat.id : null;
            }

            if (prevPlayerY >= platBottom - 1 &&
                player.y <= platBottom && player.y >= plat.y &&
                playerRight > plat.x && player.x < plat.x + plat.width &&
                player.velY < 0) {
                player.y = platBottom;
                player.velY = 0;
            }

            if (playerBottom > plat.y && player.y < platBottom) {
                if (prevPlayerX + player.width <= plat.x + 1 && playerRight > plat.x && player.x < plat.x) {
                    player.x = plat.x - player.width;
                } else if (prevPlayerX >= plat.x + plat.width - 1 && player.x < plat.x + plat.width && playerRight > plat.x + plat.width) {
                    player.x = plat.x + plat.width;
                }
            }
        });

        if (!landedOnPlatformThisFrame) {
            player.standingOnPlatformId = null;
        }
    }, [keys, gravity, jumpForce, speed]);

    // FIX: Перевірка смерті тепер теж працює з логічними координатами.
    const checkIfPlayerDied = useCallback((playerRef, currentAllPlatformsToCheck) => {
        const player = playerRef.current;
        for (let plat of currentAllPlatformsToCheck) {
            if (plat.holeType && plat.holeType !== player.playerType) {
                const platX = plat.movementType === 'horizontal' ? plat.currentX : plat.x;
                const platY = plat.movementType === 'vertical' ? plat.currentY : plat.y;

                if (player.x < platX + plat.width && player.x + player.width > platX &&
                    player.y < platY + plat.height && player.y + player.height > platY) {
                    setGameOver(true);
                    setGameOverMessage(t('level_page.player_perished', { playerType: player.playerType }));
                    return true;
                }
            }
        }
        if (player.y > DESIGN_HEIGHT) { // Перевірка падіння за межі логічного поля
             setGameOver(true);
             setGameOverMessage(t('level_page.player_fell_off', { playerType: player.playerType }));
             return true;
        }
        return false;
    }, [setGameOver, setGameOverMessage]);

    useEffect(() => {
        const handleKeyDown = (e) => { setKeys((prevKeys) => ({ ...prevKeys, [e.key.length === 1 ? e.key.toLowerCase() : e.key]: true }));};
        const handleKeyUp = (e) => { setKeys((prevKeys) => ({ ...prevKeys, [e.key.length === 1 ? e.key.toLowerCase() : e.key]: false }));};

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

            handlePlayerPushLever(firePlayer);
            handlePlayerPushLever(waterPlayer);

            const platformDeltas = { y: {}, x: {} };
            const newCalculatedMovingPlatforms = movingPlatforms.map(mp => {
                let updatedMp = { ...mp };
                if (mp.isMovingActive) {
                    let stillActive = true;
                    // FIX: Рух платформ тепер теж в логічних одиницях.
                    if (mp.movementType === 'vertical') {
                        const prevPlatformY = mp.currentY;
                        let nextPlatformY = mp.currentY;
                        if (mp.directionIsDown) {
                            nextPlatformY += mp.speed;
                            if (nextPlatformY >= mp.yRange.to) { nextPlatformY = mp.yRange.to; stillActive = false; }
                        } else {
                            nextPlatformY -= mp.speed;
                            if (nextPlatformY <= mp.yRange.from) { nextPlatformY = mp.yRange.from; stillActive = false; }
                        }
                        updatedMp.currentY = nextPlatformY;
                        if (prevPlatformY !== nextPlatformY) platformDeltas.y[mp.id] = nextPlatformY - prevPlatformY;
                    } else if (mp.movementType === 'horizontal') {
                        const prevPlatformX = mp.currentX;
                        let nextPlatformX = mp.currentX;
                        if (mp.directionIsRight) {
                            nextPlatformX += mp.speed;
                            if (nextPlatformX >= mp.xRange.to) { nextPlatformX = mp.xRange.to; stillActive = false; }
                        } else {
                            nextPlatformX -= mp.speed;
                            if (nextPlatformX <= mp.xRange.from) { nextPlatformX = mp.xRange.from; stillActive = false; }
                        }
                        updatedMp.currentX = nextPlatformX;
                        if (prevPlatformX !== nextPlatformX) platformDeltas.x[mp.id] = nextPlatformX - prevPlatformX;
                    }
                    updatedMp.isMovingActive = stillActive;
                }
                return updatedMp;
            });

            [firePlayer.current, waterPlayer.current].forEach(player => {
                if (player.onGround && player.standingOnPlatformId) {
                    const deltaY = platformDeltas.y[player.standingOnPlatformId];
                    const deltaX = platformDeltas.x[player.standingOnPlatformId];
                    if (deltaY) {
                        player.y += deltaY;
                        if (deltaY < 0 && player.velY > 0) player.velY = 0;
                    }
                    if (deltaX) player.x += deltaX;
                }
            });

            // Використовуємо `setMovingPlatforms` тільки якщо є зміни, це оптимізація
            if (JSON.stringify(movingPlatforms) !== JSON.stringify(newCalculatedMovingPlatforms)) {
                setMovingPlatforms(newCalculatedMovingPlatforms);
            }

            handleMovement(firePlayer, newCalculatedMovingPlatforms, staticPlatforms);
            handleMovement(waterPlayer, newCalculatedMovingPlatforms, staticPlatforms);

            // FIX: Передаємо немасштабовані платформи для перевірки смерті.
            const allPlatformsForDeathCheck = [...staticPlatforms, ...newCalculatedMovingPlatforms];
            if (checkIfPlayerDied(firePlayer, allPlatformsForDeathCheck) || 
                checkIfPlayerDied(waterPlayer, allPlatformsForDeathCheck)) {
                animationFrameId = requestAnimationFrame(loop); return;
            }

            // === СЕКЦІЯ МАЛЮВАННЯ: тут використовуються sX, sY, sAvg ===
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            staticPlatforms.forEach((plat) => {
                if (!plat.holeType) ctx.fillStyle = 'gray';
                else if (plat.holeType === 'fire') ctx.fillStyle = 'rgba(255, 68, 0, 0.5)';
                else if (plat.holeType === 'water') ctx.fillStyle = 'rgba(0, 8, 255, 0.5)';
                // Зберігаємо ваш оригінальний стиль малювання
                ctx.fillRect(sX(plat.x), sY(plat.y), sX(plat.width) + sY(1), sY(plat.height) + sY(1));;
            });

            newCalculatedMovingPlatforms.forEach(mp => {
                const drawX = mp.movementType === 'horizontal' ? sX(mp.currentX) : sX(mp.x);
                const drawY = mp.movementType === 'vertical' ? sY(mp.currentY) : sY(mp.y);
                ctx.fillStyle = mp.color;
                ctx.fillRect(drawX, drawY, sX(mp.width), sY(mp.height));
                // ... (код малювання ліній на платформах залишається без змін)
                const lineThickness = sAvg(3);
                let lineColor = mp.isMovingActive ? 'rgb(255, 140, 0)' : 'rgb(255, 182, 93)';
                const lineWidth = sX(mp.width) * 0.5;
                const hLineY = drawY + sY(mp.height) / 2;
                const hLineStartX = drawX + (sX(mp.width) - lineWidth) / 2;
                ctx.beginPath();
                ctx.moveTo(hLineStartX, hLineY);
                ctx.lineTo(hLineStartX + lineWidth, hLineY);
                ctx.strokeStyle = lineColor;
                ctx.lineWidth = lineThickness;
                ctx.stroke();
            });

            // (код малювання важелів залишається без змін, він вже використовує sX/sY)
            levers.forEach((lever) => {
                const housingPadding = sAvg(3);
                ctx.fillStyle = 'rgba(255, 182, 93, 0.7)';
                ctx.shadowBlur = sAvg(3);
                ctx.beginPath();
                ctx.roundRect( sX(lever.x) - housingPadding, sY(lever.y) - housingPadding, sX(lever.width) + 2 * housingPadding, sY(lever.height) + 2 * housingPadding, sAvg(4) );
                ctx.fill();
                ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
                ctx.shadowBlur = sAvg(3); ctx.shadowOffsetX = sX(1); ctx.shadowOffsetY = sY(1);
                ctx.fill();
                ctx.shadowColor = 'transparent';
                ctx.fillStyle = '#455A64';
                ctx.fillRect(sX(lever.x), sY(lever.y), sX(lever.width), sY(lever.height));
                const handleBaseThickness = sAvg(4);
                const handleTipThickness = sAvg(3);
                const knobRadius = sAvg(5);
                const handleLength = sY(lever.height) * 2.5;
                const pivotX = sX(lever.x) + sX(lever.width) / 2;
                const pivotY = sY(lever.y) + sY(lever.height) * 0.65;
                const angleDegrees = 30;
                const angleRadians = angleDegrees * (Math.PI / 180);
                let currentAngle;
                const verticalUpAngle = -Math.PI / 2;
                if (!lever.activated) {
                    if (lever.initialTiltDirection === 'right') { currentAngle = verticalUpAngle + angleRadians; } 
                    else { currentAngle = verticalUpAngle - angleRadians; }
                } else {
                    if (lever.initialTiltDirection === 'right') { currentAngle = verticalUpAngle - angleRadians; } 
                    else { currentAngle = verticalUpAngle + angleRadians; }
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
                ctx.shadowBlur = sAvg(2); ctx.shadowOffsetX = sX(1); ctx.shadowOffsetY = sY(1);
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

            finishZones.forEach((zone) => {
                ctx.fillStyle = zone.color;
                ctx.fillRect(sX(zone.x), sY(zone.y), sX(zone.width), sY(zone.height));
                ctx.strokeStyle = zone.playerType === 'fire' ? 'rgb(255, 90, 30)' : 'rgb(0, 7, 212)';
                ctx.lineWidth = sAvg(2);
                ctx.strokeRect(sX(zone.x), sY(zone.y), sX(zone.width), sY(zone.height));
            });

            // FIX: Координати гравців тепер теж масштабуються під час малювання.
            [firePlayer.current, waterPlayer.current].forEach((p) => {
                ctx.fillStyle = p.color;
                ctx.fillRect(sX(p.x), sY(p.y), sX(p.width), sY(p.height));
            });

            // FIX: Перевірка фінішу тепер працює з логічними координатами.
            const fireFinishZone = finishZones.find(z => z.playerType === 'fire');
            const waterFinishZone = finishZones.find(z => z.playerType === 'water');
            const fireDone = fireFinishZone && hasReachedFinish(firePlayer.current, fireFinishZone);
            const waterDone = waterFinishZone && hasReachedFinish(waterPlayer.current, waterFinishZone);

            if (fireDone && waterDone && !levelDone && !gameOver) { 
               
                const earnedStars = calculateStars(timer);
                setStars(earnedStars);
                saveLevelProgress('level3', timer, earnedStars); 
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
        gameOver, levelDone, movingPlatforms, levers, keys,
        handleMovement, checkIfPlayerDied, handlePlayerPushLever,
        resetGame, staticPlatforms, calculateStars, formatTime, showModal, canvasSize, saveLevelProgress, timer]);

    return (
        <div className={styles.main} style={{ width: '100%', height: '100vh' }}>
            <div ref={gameContainerRef} className={styles.gameContainer}>
            <canvas ref={canvasRef} width={canvasSize.width} height={canvasSize.height}
                style={{
                    border: '1px solid black', display: 'block', margin: '0 auto',
                    backgroundImage: `url(${background})`, backgroundSize: 'cover'
                }} />
            <div className={styles.timerBadge}>
                <Link to='/'><img src={houseIconImg} alt="Home" className={styles.houseIcon} /></Link> 
                <span className={styles.timer}>{formatTime(timer)} </span>
                <img src={reloadIconImg} alt="Reload" className={styles.reloadIcon} onClick={resetGame} />
                <img 
                    src={isFullScreen ? exitFullScreenIcon : fullScreenIcon} 
                    alt={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"} 
                    className={styles.fullscreenIcon} 
                    onClick={toggleFullScreen} 
                />
            </div>
            
            {gameOver && ( <div style={{ backgroundImage: `url(${bgmodal})`, backgroundSize: 'cover', backgroundPosition: 'center top -20px', width: '350px', height: '150px', textAlign: 'center', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', padding: '20px', borderRadius: '15px' }}> 
                <h2 className={styles.gameOver}>{t('level_page.game_over')}</h2> 
                <p className={styles.gameOverMessage}>{gameOverMessage}</p>
                 <button onClick={resetGame} className={styles.playAgain}>{t('level_page.play_again')}</button> 
                 </div> )}

            {levelDone && ( <div style={{  backgroundImage: `url(${bgmodal})`, backgroundSize: 'cover', backgroundPosition: 'center top -20px', width: '350px', height: '150px', textAlign: 'center', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', padding: '20px', borderRadius: '15px'}}> 
                <h2 className={styles.lvlCompleted}>{t('level_page.level_completed')}</h2>
                <p className={styles.time}>{t('main_page.time', { time: formatTime(timer) })}</p>
                <StarsDisplay count={stars} />
                <button onClick={resetGame} className={styles.again}>{t('level_page.play_again')}</button> 
                <button onClick={goToPreviousLevel} className={styles.previousLevel}> « </button>
                </div> )}
        </div>
        </div>
    );
};

export default ThirdLevel;