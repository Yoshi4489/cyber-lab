import { categories, labs } from "@/features/catalog/data";
import type { Learner } from "@/features/learner/model";
import styles from "./dashboard.module.css";

export function SkillProgress({ learner }: { learner: Learner }) {
  return (
    <section className={styles.panel} aria-label="Sample skill progress">
      <h2>A little stronger in every direction.</h2>
      <p>
        Explore each topic. These bars count demo completions, not skill
        assessments.
      </p>
      <div className={styles.skills}>
        {categories
          .filter((category) => category !== "All labs")
          .map((category) => {
            const available = labs.filter((lab) => lab.category === category);
            const completed = available.filter(
              (lab) => learner.completions[lab.slug] !== undefined,
            ).length;
            return (
              <div key={category}>
                <span>{category}</span>
                <progress
                  aria-label={`${category} progress`}
                  value={completed}
                  max={available.length}
                />
                <small>
                  {completed} / {available.length}
                </small>
              </div>
            );
          })}
      </div>
    </section>
  );
}
