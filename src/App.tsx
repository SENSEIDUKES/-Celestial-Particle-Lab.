import { CelestialBackdropPreview } from './workshop/CelestialBackdropPreview';
import { WorkshopHome } from './workshop/WorkshopHome';
import './styles.css';

export default function App() {
  const preview = new URLSearchParams(window.location.search).get('preview');

  if (preview === 'celestial-backdrop') {
    return <CelestialBackdropPreview />;
  }

  return <WorkshopHome />;
}
