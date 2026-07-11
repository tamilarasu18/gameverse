import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';

import LandingScreen from '../screens/LandingScreen';
import LobbyScreen from '../screens/LobbyScreen';
import ConnectFourScreen from '../games/ConnectFour/ConnectFourScreen';
import BingoScreen from '../games/Bingo/BingoScreen';
import QuoridorScreen from '../games/Quoridor/QuoridorScreen';
import DotsAndBoxesScreen from '../games/DotsAndBoxes/DotsAndBoxesScreen';
import BattleshipScreen from '../games/Battleship/BattleshipScreen';

export type RootStackParamList = {
  Landing: undefined;
  Lobby: undefined;
  ConnectFour: { roomId: string; isLocal: boolean };
  Bingo: { roomId: string; isLocal: boolean };
  Quoridor: { roomId: string; isLocal: boolean };
  DotsAndBoxes: { roomId: string; isLocal: boolean };
  Battleship: { roomId: string; isLocal: boolean };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { colors, isDark } = useTheme();

  const navTheme = {
    ...DefaultTheme,
    dark: isDark,
    colors: {
      ...DefaultTheme.colors,
      primary: colors.accentPrimary,
      background: colors.bgPrimary,
      card: colors.bgSecondary,
      text: colors.textPrimary,
      border: colors.glassBorder,
      notification: colors.accentDanger,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bgPrimary },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="Lobby" component={LobbyScreen} />
        <Stack.Screen name="ConnectFour" component={ConnectFourScreen} />
        <Stack.Screen name="Bingo" component={BingoScreen} />
        <Stack.Screen name="Quoridor" component={QuoridorScreen} />
        <Stack.Screen name="DotsAndBoxes" component={DotsAndBoxesScreen} />
        <Stack.Screen name="Battleship" component={BattleshipScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
