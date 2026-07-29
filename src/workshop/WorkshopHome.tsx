import { workshopEntries } from './manifest';

export function WorkshopHome() {
  return (
    <main className="workshop-home">
      <header className="workshop-header">
        <p className="workshop-kicker">SEN Visual Development</p>
        <h1 className="workshop-title">SEN Visual Development</h1>
        <p className="workshop-subtitle">
          The central development and preview space for SEN components and experiences.
        </p>
      </header>

      <section className="workshop-grid" aria-label="Workshop components">
        {workshopEntries.map((entry) => (
          <a className="workshop-card" href={`?preview=${entry.id}`} key={entry.id}>
            <span className="workshop-category">{entry.category}</span>
            <h2>{entry.title}</h2>
            <p>{entry.description}</p>
            <span className="workshop-status">{entry.status}</span>
          </a>
        ))}
      </section>
    </main>
  );
}
