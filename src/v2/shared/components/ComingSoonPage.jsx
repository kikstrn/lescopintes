import {
  Construction,
} from "lucide-react";

function ComingSoonPage() {
  return (
    <section className="placeholder-page glass-panel">
      <div className="placeholder-page__icon">
        <Construction size={34} />
      </div>

      <p className="section-heading__eyebrow">
        Migration V2
      </p>

      <h2>
        Page en cours de migration
      </h2>

      <p>
        Cette fonctionnalité sera
        prochainement transférée vers la
        nouvelle architecture.
      </p>
    </section>
  );
}

export default ComingSoonPage;