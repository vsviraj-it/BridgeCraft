import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  Text,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const CAR_WIDTH = 60;
const CAR_HEIGHT = 100;
const LANE_WIDTH = width / 3;

const LANES = [
  LANE_WIDTH * 0.5 - CAR_WIDTH / 2,
  LANE_WIDTH * 1.5 - CAR_WIDTH / 2,
  LANE_WIDTH * 2.5 - CAR_WIDTH / 2,
];

export default function CarGame() {
  const [lane, setLane] = useState(1);
  const carX = useRef(new Animated.Value(LANES[1])).current;
  const enemyLane = useRef(1);
  const enemyX = useRef(new Animated.Value(LANES[1])).current;
  const enemyY = useRef(new Animated.Value(-CAR_HEIGHT)).current;
  const PLAYER_Y = height - CAR_HEIGHT - 40;
  const enemyYValue = useRef(0);
  const gameOverRef = useRef(false);
  const explodeScale = useRef(new Animated.Value(1)).current;
  const explodeOpacity = useRef(new Animated.Value(1)).current;

  const triggerExplosion = () => {
    Animated.parallel([
      Animated.timing(explodeScale, {
        toValue: 2,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(explodeOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const checkCollision = () => {
    if (gameOverRef.current) return;

    const sameLane = enemyLane.current === lane;
    const enemyHitPlayer =
      enemyYValue.current + CAR_HEIGHT > PLAYER_Y &&
      enemyYValue.current < PLAYER_Y + CAR_HEIGHT;

    if (sameLane && enemyHitPlayer) {
      gameOverRef.current = true;
      triggerExplosion();
      carX.stopAnimation();
      enemyX.stopAnimation();
      enemyY.stopAnimation();
    }
  };

  useEffect(() => {
    const id = enemyY.addListener(({ value }) => {
      enemyYValue.current = value;

      checkCollision();
    });

    return () => {
      enemyY.removeListener(id);
    };
  }, [lane]);

  const startEnemyFall = () => {
    if (gameOverRef.current) return;

    enemyLane.current = Math.floor(Math.random() * 3);

    enemyX.setValue(LANES[enemyLane.current]);
    enemyY.setValue(-CAR_HEIGHT);

    Animated.timing(enemyY, {
      toValue: height + CAR_HEIGHT,
      duration: 2500,
      useNativeDriver: true,
    }).start(() => {
      if (!gameOverRef.current) {
        startEnemyFall(); // repeat
      }
    });
  };

  useEffect(() => {
    startEnemyFall();
  }, []);

  const moveCar = (newLane: number) => {
    Animated.timing(carX, {
      toValue: LANES[newLane],
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > 50 && lane < 2) {
          setLane(prev => {
            moveCar(prev + 1);
            return prev + 1;
          });
        } else if (gesture.dx < -50 && lane > 0) {
          setLane(prev => {
            moveCar(prev - 1);
            return prev - 1;
          });
        }
      },
    }),
  ).current;

  //   if (gameOver) {s
  //     return (
  //       <View style={styles.gameOver}>
  //         <Text style={styles.gameOverText}>Game Over 🚗</Text>
  //       </View>
  //     );
  //   }

  return (
    <View style={styles.container}>
      <View style={styles.road}>
        <View style={styles.lane}></View>
        <View style={styles.lane}></View>
        <View style={styles.lane}></View>
      </View>

      <Text style={styles.title}>Lane Car Game 🚗</Text>
      {gameOverRef.current && (
        <Text style={styles.gameOverText}>Game Over 💥</Text>
      )}

      <Animated.View
        style={[
          styles.enemyCar,
          {
            transform: [{ translateX: enemyX }, { translateY: enemyY }],
          },
        ]}
      />

      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.car,
          {
            transform: [{ translateX: carX }, { scale: explodeScale }],
            opacity: explodeOpacity,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
    justifyContent: 'flex-end',
    paddingBottom: 40,
  },
  road: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 40,
    gap: 20,
  },
  lane: {
    flex: 1,
    backgroundColor: '#364a72ff',
    paddingHorizontal: 40,
  },
  title: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  car: {
    width: CAR_WIDTH,
    height: CAR_HEIGHT,
    backgroundColor: '#22c55e',
    borderRadius: 10,
    position: 'absolute',
    bottom: 40,
  },
  enemyCar: {
    width: CAR_WIDTH,
    height: CAR_HEIGHT,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    position: 'absolute',
    top: 0,
  },
  gameOver: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameOverText: {
    position: 'absolute',
    color: '#fa7070ff',
    fontSize: 20,
    fontWeight: 'bold',
    top: 90,
    alignSelf: 'center',
  },
});
