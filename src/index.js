// @flow strict

import * as React from 'react';
import { Animated, Dimensions, Easing } from 'react-native';

import Confetti from './components/confetti';
import {randomValue} from './utils';

type Props = {|
  count: number,
  origin: {
    x: number,
    y: number
  },
  explosionSpeed?: number,
  fallSpeed?: number
|};

type Item = {|
  leftDelta: number,
  topDelta: number,
  swingDelta: number,
  speedDelta: {
    rotateX: number,
    rotateY: number,
    rotateZ: number
  }
|};

type State = {|
  items?: Array<Item>
|};

const TOP_MIN = 0.7;

class Explosion extends React.PureComponent<Props, State> {
  props: Props;
  state: State;

  animation: Animated.Value = new Animated.Value(0);

  componentDidMount = () => {
    this.calculateItems();
    setTimeout(() => {
      this.animate()
    }, 1000);
  };

  calculateItems = () => {
    const { count } = this.props;
    const items: Array<Item> = [];

    Array.from(Array(count).keys()).forEach(() => {
      const item: Item = {
        leftDelta: randomValue(0, 1),
        topDelta: randomValue(TOP_MIN, 1),
        swingDelta: randomValue(0.2, 1),
        speedDelta: {
          rotateX: randomValue(0.3, 1),
          rotateY: randomValue(0.3, 1),
          rotateZ: randomValue(0.3, 1)
        }
      };
      items.push(item);
    });

    this.setState({
      items
    });
  };

  animate = () => {
    const { explosionSpeed = 350, fallSpeed = 3000 } = this.props;

    Animated.sequence([
      Animated.timing(this.animation, {toValue: 0, duration: 0}),
      Animated.timing(this.animation, {
        toValue: 1,
        duration: explosionSpeed,
        easing: Easing.out(Easing.cubic)
      }),
      Animated.timing(this.animation, {
        toValue: 2,
        duration: fallSpeed,
        easing: Easing.cubic
      }),
    ]).start();
  };

  render() {
    const { origin } = this.props;
    const { height, width } = Dimensions.get('window');

    return (
      <React.Fragment>
        {this.state && this.state.items && this.state.items.map((item: Item, index: number) => {
          const left = this.animation.interpolate({
            inputRange: [0, 1, 2],
            outputRange: [origin.x, item.leftDelta * width, item.leftDelta * width]
          });
          const bottom = this.animation.interpolate({
            inputRange: [0, 1, 1 + item.topDelta, 2],
            outputRange: [origin.y, item.topDelta * height, 0, 0]
          });
          const rotateX = this.animation.interpolate({
            inputRange: [0, 2],
            outputRange: ['0deg', `${item.speedDelta.rotateX * 360 * 10}deg`]
          });
          const rotateY = this.animation.interpolate({
            inputRange: [0, 2],
            outputRange: ['0deg', `${item.speedDelta.rotateY * 360 * 5}deg`]
          });
          const rotateZ = this.animation.interpolate({
            inputRange: [0, 2],
            outputRange: ['0deg', `${item.speedDelta.rotateZ * 360 * 2}deg`]
          });
          const translateX = this.animation.interpolate({
            inputRange: [0, 0.4, 1.2, 2],
            outputRange: [0, -(item.swingDelta * 30), (item.swingDelta * 30), 0]
          })
          const transform = [{rotateX}, {rotateY}, {rotateZ}, {translateX}];

          return (
            <Confetti left={left} bottom={bottom} transform={transform} key={index} />
          );
        })}
      </React.Fragment>
    );
  }
}

export default Explosion;
