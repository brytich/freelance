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
  },
  {
    title: "Consultant QA Logiciels",
    company: "TTC Testing",
    period: "Oct. 2022 - Juil. 2023",
    description:
      "Automatisation des tests Cypress & Playwright. Mise en place CI/CD (Jenkins, GitLab).",
    details:
      "En tant que consultant QA, j'ai travaillé sur des projets d'automatisation en utilisant Cypress et Playwright. J'ai mis en place des pipelines CI/CD sur Jenkins et GitLab pour assurer une intégration continue fluide.",
  },
  {
    title: "Développeur Front-End",
    company: "NextRoad Engineering",
    period: "Mai 2022 - Août 2022",
    description:
      "Ajout de nouvelles fonctionnalités en Vue.js et Vuetify. Optimisation des performances.",
    details:
      "Durant cette mission, j'ai été chargé d'ajouter de nouvelles fonctionnalités dans une application Vue.js et Vuetify. J'ai aussi optimisé les performances et corrigé divers bugs pour améliorer la stabilité de l'application.",
  },
  {
    title: "Développeur JavaScript",
    company: "Antidots Group",
    period: "Mars 2022 - Mai 2022",
    description:
      "Développement et correction de bugs en Vue.js, gestion MongoDB et requêtes SQL.",
    details:
      "Pendant cette mission, j'étais chargé de maintenir et d'améliorer une application en Vue.js, en corrigeant des bugs et en optimisant les requêtes API. J'ai aussi géré l'intégration de MongoDB pour améliorer la gestion des données.",
  },
  {
    title: "Développeur HTML/CSS/JavaScript et Testeur QA",
    company: "Freelance",
    period: "Août 2021 - Mars 2022",
    description:
      "Développement de sites vitrine et mise en place de tests automatisés en Cypress.",
    details:
      "J'ai conçu et développé plusieurs sites vitrine en HTML/CSS/JavaScript, tout en intégrant des tests automatisés en Cypress pour garantir leur bon fonctionnement. J'ai également travaillé sur la gestion du backlog et la création de tickets Jira.",
  },
  {
    title: "Développeur Junior",
    company: "Manutan",
    period: "Janv. 2020 - Août 2020",
    description:
      "Résolution de problèmes et développement de tests automatisés en Jest et Postman.",
    details:
      "Lors de ce premier rôle en tant que développeur, j'ai contribué à la maintenance et au refactoring de code en ReactJS, et j'ai mis en place des tests automatisés en Jest et Postman pour améliorer la fiabilité du projet.",
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
<h2 className="section-title">
  <span className="gradient-text">Expérience</span>
</h2>        <div className="experience-grid">
          {experiences.map((exp, index) => (
            <motion.div
              key={index}
              className="experience-card"
              whileHover={{ scale: 1.05 }}
            >
              
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
  <div className="footer-content">
    <h3 className="footer-title">Contact</h3>
      <p className="footer-rights"> bryan.catiche@gmail.com</p>
      <p className="footer-rights"> 06 34 23 52 57</p>
      <p className="footer-rights"> Noisy le Grand</p>

    <p className="footer-rights">© 2025</p>
  </div>
</footer>


    </div>
  );
};

export default HomePage;
