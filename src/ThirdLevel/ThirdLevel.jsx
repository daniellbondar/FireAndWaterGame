import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './ThirdLevel.module.css';
import background from '../images and icons/photo_2025-05-17_21-18-18-Picsart-AiImageEnhancer.jpg';
import bgmodal from '../images and icons/photo_2025-05-17_22-03-58.jpg';
import reloadIconImg from '../images and icons/Refresh.svg';
import houseIconImg from '../images and icons/Outline.svg';

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
    const [nextLevelUnlocked, setNextLevelUnlocked] = useState(false);
    
    
    const navigate = useNavigate();

    const goToPreviousLevel = () => {
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
        {x: 150, y: 490, width: 50, height: 20},

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
        {
            id: 'verticalPlatform',
            x: 600,
            initialY: 220, // Починає знизу
            currentY: 220,
            width: 80,
            height: 20,
            isMovingActive: false,
            directionIsDown: true, // Початковий напрямок не важливий, важіль його змінить
            // ▼▼▼ ВИПРАВЛЕНО ▼▼▼
            yRange: { from: 90, to: 220 }, // from: верхня точка, to: нижня точка
            speed: 0.4,
            color: 'gray',
            movementType: 'vertical'
        },
        {
            id: 'horizontalPlatform',
            initialX: 200,
            currentX: 200,
            y: 520,
            width: 80,
            height: 20,
            isMovingActive: false,
            directionIsRight: true,
            xRange: { from: 10, to: 200 },
            speed: 0.7,
            color: 'gray',
            movementType: 'horizontal'
        }
    ];
    const [movingPlatforms, setMovingPlatforms] = useState(initialMovingPlatforms);

    // Levers
    const initialLevers = [
        {
            id: 1, x: 170, y: 90, width: 25, height: 10, activated: false,
            initialTiltDirection: 'right', activatesPlatformId: 'verticalPlatform', lastActivationTime: 0
        },
        {
            id: 2, x: 1020, y: 80, width: 25, height: 10, activated: false,
            initialTiltDirection: 'left', activatesPlatformId: 'horizontalPlatform', lastActivationTime: 0
        }
    ];
    const [levers, setLevers] = useState(initialLevers);

    const groundY = 690; // Використовуємо main ground y

    const formatTime = useCallback((time) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, []);

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
        if (time > 25 || time < 35) return 2;
        if (time >= 35) return 1;
        
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
        x: 470, 
        y: 250, 
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
        x: 590, 
        y: 250, 
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
        firePlayer.current = { ...firePlayer.current, x: 470, y: 250, velY: 0, onGround: false, standingOnPlatformId: null };
        waterPlayer.current = { ...waterPlayer.current, x: 590, y: 250, velY: 0, onGround: false, standingOnPlatformId: null };
        setLevers(initialLevers.map(l => ({ ...l, activated: false, lastActivationTime: 0 })));
        setMovingPlatforms(initialMovingPlatforms.map(p => {
             if (p.movementType === 'vertical') {
                return { ...p, currentY: p.initialY, isMovingActive: false, directionIsDown: true };
            } else if (p.movementType === 'horizontal') {
                return { ...p, currentX: p.initialX, isMovingActive: false, directionIsRight: true };
            }
            return p;
        }));
    }, [initialLevers, initialMovingPlatforms]);

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
    
    // ▼▼▼ ВИПРАВЛЕНО ТА СПРОЩЕНО ▼▼▼
    const handlePlayerPushLever = useCallback((playerRef) => {
        const leverCooldownMs = 5000; // Кулдаун, щоб уникнути подвійних натискань
        const player = playerRef.current;
        const currentTime = Date.now();

        setLevers(prevLevers => {
            let stateActuallyChanged = false;
            const updatedLevers = prevLevers.map(lever => {
                const playerRect = { x: player.x, y: player.y, width: player.width, height: player.height };
                const leverRect = { x: lever.x, y: lever.y, width: lever.width, height: lever.height };

                if (
                    playerRect.x < leverRect.x + leverRect.width &&
                    playerRect.x + playerRect.width > leverRect.x &&
                    playerRect.y < leverRect.y + leverRect.height &&
                    playerRect.y + playerRect.height > leverRect.y
                ) {
                    if (currentTime - lever.lastActivationTime < leverCooldownMs) {
                        return lever; // Зарано, нічого не робимо
                    }

                    setMovingPlatforms(prevMovingPlats =>
                        prevMovingPlats.map(plat => {
                            if (plat.id === lever.activatesPlatformId) {
                                // Проста і надійна логіка:
                                // 1. Завжди активуємо рух.
                                // 2. Завжди змінюємо напрямок на протилежний.
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
            if (stateActuallyChanged) return updatedLevers;
            return prevLevers;
        });
    }, [setLevers, setMovingPlatforms]);

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
                width: mp.width, height: mp.height, isMoving: true
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

    }, [keys, gravity, jumpForce, speed, staticPlatforms]);

    const checkIfPlayerDied = useCallback((playerRef, currentAllPlatformsToCheck) => {
        const player = playerRef.current;
        for (let plat of currentAllPlatformsToCheck) {
            if (plat.holeType && plat.holeType !== player.playerType) {
                const platX = plat.movementType === 'horizontal' ? plat.currentX : plat.x;
                const platY = plat.movementType === 'vertical' ? plat.currentY : plat.y;

                if (player.x < platX + plat.width && player.x + player.width > platX &&
                    player.y < platY + plat.height && player.y + player.height > platY) {
                    setGameOver(true);
                    setGameOverMessage(`Player ${player.playerType} perished!`);
                    return true;
                }
            }
        }
        if (player.y > (canvasRef.current?.height || 700)) {
             setGameOver(true);
             setGameOverMessage(`Player ${player.playerType} fell off!`);
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

            handlePlayerPushLever(firePlayer);
            handlePlayerPushLever(waterPlayer);

            const platformDeltas = { y: {}, x: {} };
            const newCalculatedMovingPlatforms = movingPlatforms.map(mp => {
                let updatedMp = { ...mp };
                if (mp.isMovingActive) {
                    let stillActive = true;
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
                    const platformPlayerIsOn = newCalculatedMovingPlatforms.find(p => p.id === player.standingOnPlatformId);
                    if (platformPlayerIsOn) {
                        if (platformPlayerIsOn.movementType === 'vertical' && platformDeltas.y[player.standingOnPlatformId]) {
                            player.y += platformDeltas.y[player.standingOnPlatformId];
                            if (platformDeltas.y[player.standingOnPlatformId] < 0 && player.velY > 0) player.velY = 0;
                        } else if (platformPlayerIsOn.movementType === 'horizontal' && platformDeltas.x[player.standingOnPlatformId]) {
                            player.x += platformDeltas.x[player.standingOnPlatformId];
                        }
                    }
                }
            });

            if (JSON.stringify(movingPlatforms) !== JSON.stringify(newCalculatedMovingPlatforms)) {
                setMovingPlatforms(newCalculatedMovingPlatforms);
            }
            
            handleMovement(firePlayer, newCalculatedMovingPlatforms, staticPlatforms);
            handleMovement(waterPlayer, newCalculatedMovingPlatforms, staticPlatforms);

            const allPlatformsForDeathCheck = [
                ...staticPlatforms, 
                ...newCalculatedMovingPlatforms.map(mp => ({
                    ...mp, 
                    x: mp.movementType === 'horizontal' ? mp.currentX : mp.x,
                    y: mp.movementType === 'vertical' ? mp.currentY : mp.y
                }))
            ];
            if (checkIfPlayerDied(firePlayer, allPlatformsForDeathCheck) || 
                checkIfPlayerDied(waterPlayer, allPlatformsForDeathCheck)) {
                animationFrameId = requestAnimationFrame(loop); return;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            staticPlatforms.forEach((plat) => {
                if (!plat.holeType) ctx.fillStyle = 'gray';
                else if (plat.holeType === 'fire') ctx.fillStyle = 'rgba(255, 68, 0, 0.5)';
                else if (plat.holeType === 'water') ctx.fillStyle = 'rgba(0, 8, 255, 0.5)';
                ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
            });

            newCalculatedMovingPlatforms.forEach(mp => {
                const drawX = mp.movementType === 'horizontal' ? mp.currentX : mp.x;
                const drawY = mp.movementType === 'vertical' ? mp.currentY : mp.y;
                ctx.fillStyle = mp.color;
                ctx.fillRect(drawX, drawY, mp.width, mp.height);
                const lineThickness = 3;
                let lineColor = mp.isMovingActive ? 'rgb(255, 140, 0)' : 'rgb(255, 182, 93)';

                const lineWidth = mp.width * 0.5;
                const hLineY = drawY + mp.height / 2;
                const hLineStartX = drawX + (mp.width - lineWidth) / 2;

                if (mp.movementType === 'horizontal') {  
                    ctx.beginPath(); ctx.moveTo(hLineStartX, hLineY); ctx.lineTo(hLineStartX + lineWidth, hLineY);
                    ctx.strokeStyle = lineColor; ctx.lineWidth = lineThickness; ctx.stroke();
                } else {
                    ctx.beginPath(); 
                    ctx.moveTo(hLineStartX, hLineY); 
                    ctx.lineTo(hLineStartX + lineWidth, hLineY);
                    ctx.strokeStyle = lineColor; 
                    ctx.lineWidth = lineThickness; ctx.stroke();
                }
            });
            
            levers.forEach((lever) => {
                const housingPadding = 3;
                ctx.fillStyle = 'rgba(255, 182, 93, 0.7)';
                ctx.shadowBlur = 3;
                ctx.beginPath();
                ctx.roundRect(
                    lever.x - housingPadding,
                    lever.y - housingPadding,
                    lever.width + 2 * housingPadding,
                    lever.height + 2 * housingPadding,
                    4
                );
                ctx.fill();
                ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
                ctx.shadowBlur = 3; ctx.shadowOffsetX = 1; ctx.shadowOffsetY = 1;
                ctx.fill();
                ctx.shadowColor = 'transparent';
                ctx.fillStyle = '#455A64';
                ctx.fillRect(lever.x, lever.y, lever.width, lever.height);
                const handleBaseThickness = 4;
                const handleTipThickness = 3;
                const knobRadius = 5;
                const handleLength = lever.height * 2.5;
                const pivotX = lever.x + lever.width / 2;
                const pivotY = lever.y + lever.height * 0.65;
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
                ctx.shadowBlur = 2; ctx.shadowOffsetX = 1; ctx.shadowOffsetY = 1;
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
                ctx.fillStyle = zone.color; ctx.fillRect(zone.x, zone.y, zone.width, zone.height);
                ctx.strokeStyle = 'rgb(0, 7, 212)';
                ctx.lineWidth = 2;

                if (zone.playerType === 'fire') {
                    ctx.strokeStyle = 'rgb(255, 90, 30)';
                }

                ctx.strokeRect(zone.x, zone.y, zone.width, zone.height)
            });

            [firePlayer.current, waterPlayer.current].forEach((p) => { ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, p.width, p.height); });
            
            const fireDone = hasReachedFinish(firePlayer.current, finishZones.find(z => z.playerType === 'fire'));
            const waterDone = hasReachedFinish(waterPlayer.current, finishZones.find(z => z.playerType === 'water'));
            if (fireDone && waterDone && !levelDone && !gameOver) { setLevelDone(true); }

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
        resetGame, staticPlatforms, calculateStars, formatTime, showModal
    ]);

    return (
        <div className={styles.main} style={{ width: '100%', height: '100vh' }}>
            <canvas ref={canvasRef} width={1100} height={700}
                style={{
                    border: '1px solid black', display: 'block', margin: '0 auto',
                    backgroundImage: `url(${background})`, backgroundSize: 'cover'
                }} />
            <div className={styles.timerBadge}>
                <Link to='/'>
                <img src={houseIconImg} alt="Home" className={styles.houseIcon} />
                </Link> 
                {formatTime(timer)}
                <img src={reloadIconImg} alt="Reload" className={styles.reloadIcon} onClick={resetGame} /> 
            </div>
            
            {gameOver && ( <div style={{ backgroundImage: `url(${bgmodal})`, backgroundSize: 'cover', backgroundPosition: 'center top -20px', width: '350px', height: '150px', textAlign: 'center', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', padding: '20px', borderRadius: '15px' }}> 
                <h2 className={styles.gameOver}>Game over</h2> 
                <p className={styles.gameOverMessage}>{gameOverMessage}</p>
                 <button onClick={resetGame} className={styles.playAgain}>Play again</button> 
                 </div> )}

            {levelDone && ( <div style={{  backgroundImage: `url(${bgmodal})`, backgroundSize: 'cover', backgroundPosition: 'center top -20px', width: '350px', height: '150px', textAlign: 'center', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', padding: '20px', borderRadius: '15px'}}> 
                <h2 className={styles.lvlCompleted}>Level Completed!</h2>
                <p className={styles.time}>Time: {formatTime(timer)}</p>
                <StarsDisplay count={stars} />
                <button onClick={resetGame} className={styles.again}>Play again</button> 
                <button onClick={goToPreviousLevel} className={styles.previousLevel}> &laquo; </button>
                </div> )}
        </div>
    );
};

export default ThirdLevel;