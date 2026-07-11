# GameVerse

**GameVerse** is a modern, cross-platform mobile application built with React Native and Expo. It serves as a multiplayer game hub where users can play classic board games either locally (pass-and-play) or online with friends in real-time.

## 🚀 How the App Starts & Works

### App Entry Point
The app initializes from `App.tsx`, which wraps the application in a series of context providers (`PlayerProvider`, `ThemeProvider`, `MultiplayerProvider`) and loads custom fonts. The routing is handled by `src/navigation/AppNavigator.tsx`, using `@react-navigation/native-stack`.

### Core Architecture
- **Context API:** Global state is managed using React Context. 
  - `PlayerContext`: Manages the user's local profile (username and avatar) using AsyncStorage.
  - `MultiplayerContext`: Handles real-time synchronization with Firebase, creating rooms, joining rooms, and broadcasting game state updates.
- **Navigation:** The user starts at the `LandingScreen` to set up their profile, then proceeds to the `LobbyScreen` where they can choose a game and either play locally or create/join an online room.
- **Game Engine:** Each game has its own dedicated directory under `src/games/`. Inside each game folder, there is a `logic.ts` (pure functions handling the rules, win conditions, and state transitions), a `Board.tsx` (the visual rendering of the game), and a `<GameName>Screen.tsx` (the React Native screen managing the interaction and Firebase sync).

## 📂 Folder Structure

```text
gameverse-mobile/
├── assets/                 # App icons, splash screens, and game card images
├── src/                    # Main source code directory
│   ├── components/         # Reusable UI components (GameCard, ThemeToggle, etc.)
│   ├── config/             # Configuration files (Firebase setup)
│   ├── context/            # React Context providers (Player, Theme, Multiplayer)
│   ├── games/              # Individual game engines and screens
│   │   ├── Battleship/     
│   │   ├── Bingo/          
│   │   ├── ConnectFour/    
│   │   ├── DotsAndBoxes/   
│   │   ├── HandCricket/    # Simultaneous turn-based logic and UI
│   │   ├── Quoridor/       
│   │   └── RPS/            # Rock Paper Scissors logic and UI
│   ├── navigation/         # React Navigation routing configuration
│   ├── screens/            # Main app screens (Landing, Lobby)
│   └── theme/              # Global styling tokens (colors, typography, spacing)
├── App.tsx                 # Application entry point
├── app.json                # Expo configuration
└── tsconfig.json           # TypeScript configuration
```

## 🎲 Included Games
1. **Connect Four:** Classic 4-in-a-row gravity-based drop game.
2. **Bingo (5x5):** Competitive number-calling game requiring 5 full lines to win.
3. **Quoridor:** Strategic maze game where players navigate to the opposite side while placing walls to block their opponent.
4. **Dots and Boxes:** Classic pen-and-paper game of drawing lines to claim boxes.
5. **Battleship:** Strategic naval combat game with blind ship placement and guessing.
6. **Rock Paper Scissors:** Fast-paced Best-of-5 duel using a simultaneous turn reveal mechanic.
7. **Hand Cricket:** Turn-based cricket simulator where players throw numbers 1-6 using hand emojis.

## 📦 Tech Stack & Packages Used
- **React Native (`react-native`)**: Core framework for building native mobile views.
- **Expo (`expo`)**: Development framework and tooling to build the app seamlessly for Android and iOS.
- **Firebase (`firebase`)**: Firebase Realtime Database is used for lightning-fast online multiplayer state synchronization.
- **React Navigation (`@react-navigation/native` & `native-stack`)**: Used for seamless screen-to-screen transitions.
- **AsyncStorage (`@react-native-async-storage/async-storage`)**: Used for persisting player profiles (avatars and names) locally on the device.
- **Expo Haptics (`expo-haptics`)**: Provides tactile vibration feedback when placing pieces, dropping bombs, or winning a game to make the app feel premium.
- **Expo Font (`expo-font`)**: Used to load custom sci-fi/gaming fonts like `Chakra Petch` and `Russo One`.

## 🧠 Complexities & Challenges Faced

Building a real-time multiplayer hub is no small feat. Here are some of the major technical hurdles we solved during development:

1. **Complex State Synchronization:** 
   Unlike a simple chat app, board games have deeply nested state arrays (e.g., the 5x5 Bingo grid, or the 9x9 Quoridor board with wall arrays). We had to ensure that when a player makes a move, the `logic.ts` engine validates it locally, updates the state, and successfully serializes and pushes it to Firebase without race conditions.
   
2. **Turn-Based Rule Enforcement Online:** 
   We had to implement robust conditional logic to ensure players can only interact with the board if it is *their* turn and they are in an online room, preventing cheating or accidental double-moves. We also had to implement dynamic rendering to hide the opponent's Battleship and Bingo boards in online play.

3. **Simultaneous Turn Architecture:**
   For *Rock Paper Scissors* and *Hand Cricket*, we architected a simultaneous state engine. The Firebase state uses an intermediate `choosing` phase where players lock in their moves secretly. Only when both players are locked in does the state transition to `revealing`, preventing the second player from seeing the first player's move in the database before they choose.

4. **Win Conditions & Game Rules:**
   Each game required a custom algorithm to detect wins. For example, Quoridor required a pathfinding algorithm to ensure players cannot place walls that completely trap their opponent. Bingo required detecting horizontal, vertical, and diagonal lines to count "strikes" accurately.

5. **Metro Bundler Caching Issues:** 
   While rapidly refactoring the codebase (moving multiplayer logic into custom hooks and contexts), we ran into severe React Native Metro cache issues where old imports were persisting. We solved this by executing terminal scripts to update file timestamps, forcing Metro to completely clear its cache and rebuild the bundle from scratch.

6. **UI/UX Consistency:** 
   Designing a premium "Copper / Sci-Fi" theme that worked perfectly across 7 completely different board game layouts, while ensuring responsive scaling on both small phones and larger devices, required careful flexbox architecture and absolute positioning (especially for Quoridor walls and Dots & Boxes lines).
