import { useState, useEffect, useCallback } from "react"; 

const levelDataKey = 'fireAndWaterGameProgress';

const initialData = {
    level1: {
        completed: false,
        time: null,
        stars: 0
    },
    level2: {
        completed: false,
        time: null,
        stars: 0
    },
    level3: {
        completed: false,
        time: null,
        stars: 0
    }
}


export const useLevelData = () => {
    const [levelData, setLevelData] = useState(() => {
        try{
            const data = window.localStorage.getItem(levelDataKey);
            return data ? JSON.parse(data) : initialData;
        } catch(error) {
            console.error('Error reading from localStorage', error);
            return initialData;
        }
        })



    useEffect(() => {
        try {
            window.localStorage.setItem(levelDataKey, JSON.stringify(levelData));
        } catch (error) {
            console.error('Error writing to localStorage', error);
        }
    },[levelData]);


    const saveLevelProgress = useCallback((levelId, time, stars) => {

        setLevelData(prevData => {
            const currentLevelProgress = prevData[levelId];

            const isNewScoreBetter = stars > currentLevelProgress.stars || 
                                     (stars === currentLevelProgress.stars && 
                                      time < currentLevelProgress.time);

                  if (isNewScoreBetter) {
                    return{
                        ...prevData,
                        [levelId]: {
                            completed: true,
                            time: time,
                            stars: stars
                        },
                    };
                  }

                  return prevData;
        
        })
    }, [])

    const resetAllProgress = useCallback(() => {
        setLevelData(initialData);
    }, []);

    return {
        levelData,
        saveLevelProgress,
        resetAllProgress
    };
    
};