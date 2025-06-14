import React, { use } from 'react';
import { Link } from 'react-router-dom';
import { useLevelData } from '../hooks/useLevelData';
import { useTranslation } from 'react-i18next';
import styles from './Main.module.css';
import bg from '../images and icons/photo_2025-06-07_12-53-48.jpg'
import lockedIcon from '../images and icons/Lock.svg'
import unlockedIcon from '../images and icons/Unlock.svg'


const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className={styles.languageSwitcher}>
            <button onClick={() => changeLanguage('en')} disabled={i18n.language === 'en'} className={styles.langBtn}>EN</button>
            <button onClick={() => changeLanguage('uk')} disabled={i18n.language === 'uk'} className={styles.langBtnUA}>UA</button>
        </div>
    );
};



const StarsDisplay = ({ count }) => (
    <div className={styles.stars}>
        {[...Array(3)].map((_, i) => (
            <span key={i} className={i < count ? styles.starFilled : styles.starEmpty}>
                ⭐
            </span>
        ))}
    </div>
);

const formatTime = (time) => {
    if (time === null || typeof time === 'undefined') return "N/A";
         
    const minutes = Math.floor (time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;  
    
}

const levelsConfig = [
    { id: 'level1', name: 'Level 1', path: '/level1' },
    { id: 'level2', name: 'Level 2', path: '/level2' }, 
    { id: 'level3', name: 'Level 3', path: '/level3' },
];

function Main() {
    const { levelData, resetAllProgress } = useLevelData();
     console.log('Current levelData from hook:', levelData);

    const { t } = useTranslation();

     const handleClearClick = () => {
        if (window.confirm('Are you sure you want to reset all your progress? This action cannot be undone.')) {
           resetAllProgress(); 
        }
     }

  return (
    <div>
            <img src={bg} className={styles.bg} alt="Background" />
            <LanguageSwitcher/>
            <div className={styles.container}>
                {levelsConfig.map((level, index) => {
                    // --- Етап 1: Підготовка даних ---
                    const data = levelData[level.id];
                    let isLocked = false;
                    let lockMessage = '';

                    if (index > 0) {
                        const prevLevelData = levelData[levelsConfig[index - 1].id];
                        if (!prevLevelData.completed) {
                            isLocked = true;
                            
                            lockMessage = t('main_page.lock_message_prev_level');
                        } else if (prevLevelData.stars < 2) {
                            isLocked = true;
                            
                            lockMessage = t('main_page.lock_message_stars');
                        }
                    }

                    // ▼▼▼ КЛЮЧОВА ЗМІНА: Визначаємо, яку іконку показати, ЗАЗДАЛЕГІДЬ ▼▼▼
                    const iconSrc = isLocked ? lockedIcon : unlockedIcon;

                    // --- Етап 2: Рендеринг ---
                    const levelContent = (
                        <>
                            <div className={styles.levelHeader}>
                                <h2 className={styles.levelName}>{t('main_page.level', { number: index + 1 })}</h2>
                                
                                <img src={iconSrc} alt={isLocked ? "Locked" : "Unlocked"} className={styles.lockIcon} />
                            </div>

                            {/* Показуємо решту інформації в залежності від стану */}
                            {isLocked ? (
                                <p className={styles.lockMessage}>{lockMessage}</p>
                            ) : data.completed ? (
                                <div className={styles.levelInfo}>
                                    <p className={styles.timer}>{t('main_page.time', { time: formatTime(data.time) })}</p>
                                    <StarsDisplay count={data.stars} />
                                </div>
                            ) : (
                                <p className={styles.startText}>{t('main_page.start_text')}</p>
                            )}
                        </>
                    );

                    // return (
                    //     <div key={level.id} >
                    //         {/* ... */}
                    //         {data.completed && (
                    //             <>
                    //                 {/* ▼▼▼ І ЦЕЙ РЯДОК ДЛЯ ВІЗУАЛЬНОЇ ПЕРЕВІРКИ ▼▼▼ */}
                    //                 <p style={{ color: 'white', background: 'black' }}>
                    //                     DEBUG: Stars for {level.id} is {data.stars} (type: {typeof data.stars})
                    //                 </p>
                    //             </>
                    //         )}
                    //         {levelContent}
                    //     </div>
                    // );

                    return isLocked ? (
                        <div key={level.id} className={`${styles.levels} ${styles.locked}`}>
                            {levelContent}
                        </div>
                    ) : (
                        <Link key={level.id} to={level.path} className={styles.levels}>
                            {levelContent}
                        </Link>
                    );
                })}
            </div>

            <button onClick={handleClearClick} className={styles.clearBtn}>{t('main_page.clear_results')}</button>
        </div>
    );
}

export default Main;