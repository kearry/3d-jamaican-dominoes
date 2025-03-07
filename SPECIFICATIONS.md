# Technical Specifications

This document outlines the technical specifications and architecture of the 3D Jamaican Dominoes game.

## System Architecture

The application follows a client-side architecture built on Next.js with React components and hooks for state management.

### Component Structure

```
App
├── GameBoard
│   ├── DominoChain
│   │   ├── Table
│   │   └── Domino (multiple instances)
│   ├── PlayerHand (for each player)
│   │   └── Domino (multiple instances)
│   └── GameControls
```

### State Management

Game state is managed through React Context API (`GameContext`), providing the following:

- Current game phase (setup, play, end)
- Player information and turns
- Domino chain
- Available dominoes for each player
- Game rules validation

## Key Technical Components

### 1. 3D Rendering (Three.js with React Three Fiber)

- **Canvas Setup**: Implemented in `DominoChain.tsx` with proper camera positioning, lighting, and shadows
- **3D Models**:
  - `Domino.tsx`: Renders individual domino tiles with proper pip placement
  - `Table.tsx`: Renders the wooden table surface with appropriate texture and dimensions

### 2. Game Logic

- **Domino Placement Logic**:
  - Calculates correct positions and rotations based on chain structure
  - Special handling for double dominoes (perpendicular placement)
  - Ensures proper spacing between dominoes
- **Game Rules Validation**:
  - Validates domino placement against game rules
  - Manages turn order and game progression
  - Detects game end conditions

### 3. AI Players

- Simple AI implementation that follows basic domino strategy
- Prioritizes playing highest value dominoes when possible
- Handles blocked game scenarios

## Technical Details

### Domino Rendering

Each domino is rendered as a 3D box with dimensions `[1, 0.2, 2]` (width, height, length) with spots rendered as small spheres on the surface. Key aspects:

- Spots are positioned dynamically based on the domino's value
- Special positioning for the divider line between values
- Shadow casting and receiving for realistic appearance
- Interactive elements for user interaction

### Domino Chain Positioning Algorithm

The positioning algorithm in `calculateDominoPositionAndRotation` function handles:

1. First domino centered on the table
2. Proper rotation for dominoes (flat on the table)
3. Different positioning based on left/right end placement
4. Special rotation handling for double dominoes (90° rotation)
5. Appropriate spacing between dominoes

```typescript
// Simplified example of positioning algorithm
const calculateDominoPositionAndRotation = (
  domino: Domino,
  chain: Domino[],
  end: "left" | "right" | "any"
): {
  position: [number, number, number];
  rotation: [number, number, number];
} => {
  // For first domino
  if (chain.length === 0) {
    return {
      position: [0, 0, 0],
      rotation: [Math.PI / 2, isDouble ? Math.PI / 2 : 0, 0],
    };
  }

  // For subsequent dominoes - calculate position based on placement end
  // and handle special cases like double dominoes
  // ...
};
```

### Performance Considerations

- Optimized 3D rendering with proper use of instances where possible
- Efficient state updates to minimize re-renders
- Shadow quality balanced for performance vs. visual quality

## Browser Compatibility

The application is designed to work on modern browsers that support WebGL:

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

## Future Technical Enhancements

- Multiplayer support via WebSockets
- Enhanced AI with more sophisticated strategy
- Mobile-optimized controls and responsive design
- Improved animations and visual effects
- Game history and statistics tracking

## Dependencies

- `next`: ^14.2.5
- `react`: ^18.2.0
- `react-dom`: ^18.2.0
- `three`: ^0.160.0
- `@react-three/fiber`: ^8.15.11
- `@react-three/drei`: ^9.88.16
- `tailwindcss`: ^3.3.0
- `next-auth`: ^4.24.5
- `typescript`: ^5.0.0