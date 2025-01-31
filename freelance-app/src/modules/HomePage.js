import React, { useState } from "react";
import { motion } from "framer-motion";
import "../css/homeStyle.css";
import { FaExternalLinkAlt, FaTimes } from "react-icons/fa";

const experiences = [
  {
    title: "Ingénieur QA Automatisation",
    company: "Stormshield",
    period: "Juillet 2023 - Aujourd'hui",
    description:
      "Développement de stratégies de test et automatisation via Cypress. Gestion du backlog via Jira.",
    details:
      "En tant qu'ingénieur QA chez Stormshield, je suis responsable de la mise en place des stratégies de test et de l'automatisation des tests en utilisant Cypress. J'intègre des scénarios Gherkin pour assurer la conformité aux exigences, et je gère les tâches via Jira pour optimiser les workflows.",
    image: "/images/qa-engineer.jpg",
  },
  {
    title: "Consultant QA Logiciels",
    company: "TTC Testing",
    period: "Oct. 2022 - Juil. 2023",
    description:
      "Automatisation des tests Cypress & Playwright. Mise en place CI/CD (Jenkins, GitLab).",
    details:
      "En tant que consultant QA, j'ai travaillé sur des projets d'automatisation en utilisant Cypress et Playwright. J'ai mis en place des pipelines CI/CD sur Jenkins et GitLab pour assurer une intégration continue fluide.",
    image: "/images/qa-consultant.jpg",
  },
];

const HomePage = () => {
  const [selectedExperience, setSelectedExperience] = useState(null);

  return (
    <div className="homepage-container">
<header className="header">
  <h1 className="title">Bryan CATICHE - QA Automation Engineer</h1>
  <p className="subtitle">Spécialiste en Cypress, Playwright et Automatisation QA</p>
</header>


      <section className="experience-section">
        <h2 className="section-title">Expérience</h2>
        <div className="experience-grid">
          {experiences.map((exp, index) => (
            <motion.div
              key={index}
              className="experience-card"
              whileHover={{ scale: 1.05 }}
            >
              <img src={exp.image} alt={exp.title} className="experience-img" />
              <div className="experience-content">
                <h3>{exp.title}</h3>
                <p className="company">{exp.company} | {exp.period}</p>
                <p className="description">{exp.description}</p>
                <button className="read-more-btn" onClick={() => setSelectedExperience(exp)}>
                  Lire plus <FaExternalLinkAlt size={12} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {selectedExperience && (
        <div className="modal-overlay" onClick={() => setSelectedExperience(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedExperience(null)}>
              <FaTimes />
            </button>
            <img src={selectedExperience.image} alt={selectedExperience.title} className="modal-img" />
            <h2>{selectedExperience.title}</h2>
            <p className="company">{selectedExperience.company} | {selectedExperience.period}</p>
            <p className="details">{selectedExperience.details}</p>
          </div>
        </div>
      )}

      <footer className="footer">
        <p>© 2025 Bryan Cat - Tous droits réservés</p>
      </footer>
    </div>
  );
};

export default HomePage;
