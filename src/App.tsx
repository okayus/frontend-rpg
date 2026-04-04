import { MapView } from './features/map/MapView';
import { usePlayerMovement } from './features/map/usePlayerMovement';
import { grasslandMap } from './data/maps/grassland';

function App() {
  const player = usePlayerMovement(grasslandMap);

  return (
    <main>
      <MapView map={grasslandMap} playerPos={player.position} />
    </main>
  );
}

export default App;
