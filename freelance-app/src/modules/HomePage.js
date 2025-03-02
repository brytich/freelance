import React, { useState } from "react";
import { Card, CardContent, Button, Typography, Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import "../css/homeStyle.css";
import CloseIcon from "@mui/icons-material/Close";
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCards, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-cards';
import 'swiper/css/pagination';
import 'swiper/css/navigation';


const skills = [
  "Cypress",
  "Playwright",
  "Gherkin",
  "Jira",
  "GitLab CI/CD",
  "Jenkins",
  "Vue.js",
  "ReactJS",
  "MongoDB",
  "SQL",
  "Jest",
  "Postman"
];

const experiences = [
  {
    title: "Ingénieur QA Automatisation",
    company: "Stormshield",
    period: "Juillet 2023 - Aujourd'hui",
    description:
      "Pilotage de stratégies de tests E2E et automatisation avancée sous Cypress.",
    details: `
Responsable de la mise en place et de l’optimisation des stratégies de test automatisé avec Cypress, intégration de scénarios Gherkin pour garantir la conformité fonctionnelle et gestion complète du backlog via Jira.

Mission clé :
- Réduction des anomalies critiques en production et mise en place de stratégie QA de bout en bout et création de test d'automatisation (cypress) pour la régression.
    `,
  },
  {
    title: "Consultant QA Logiciels",
    company: "TTC Testing",
    period: "Oct. 2022 - Juil. 2023",
    description:
      "Conception et automatisation de tests Cypress & Playwright avec CI/CD.",
    details: `
Participation à des projets complexes d’automatisation avec Cypress et Playwright, mise en place de pipelines CI/CD robustes via Jenkins et GitLab, accompagnement des équipes dans l’industrialisation des processus de tests.

Mission clé :
- Accélération des cycles de déploiement grâce à une industrialisation complète des tests.
    `,
  },
  {
    title: "Développeur Front-End",
    company: "NextRoad Engineering",
    period: "Mai 2022 - Août 2022",
    description:
      "Développement et optimisation d’interfaces Vue.js & Vuetify.",
    details: `
Ajout de fonctionnalités sur une application Vue.js avec Vuetify, optimisation des performances et résolution de bugs critiques pour garantir la fluidité et la stabilité de l'expérience utilisateur.

Mission clé :
- Augmentation de la performance front-end et réduction des temps de chargement.
    `,
  },
  {
    title: "Développeur JavaScript",
    company: "Antidots Group",
    period: "Mars 2022 - Mai 2022",
    description:
      "Maintenance et évolution d’une application Vue.js avec MongoDB.",
    details: `
Correction de bugs critiques et optimisation des performances grâce à des requêtes API optimisées. Amélioration de la gestion des données via MongoDB.

Mission clé :
- Stabilisation du projet et amélioration des performances globales.
    `,
  },
  {
    title: "Développeur HTML/CSS/JavaScript & Testeur QA",
    company: "Freelance",
    period: "Août 2021 - Mars 2022",
    description:
      "Création de sites vitrines et automatisation de tests avec Cypress.",
    details: `
Conception et développement de sites vitrines modernes, accompagnée d’une couverture de tests E2E automatisés sous Cypress pour assurer la qualité des livraisons.

Mission clé :
- Garantie de la qualité et de la robustesse des livrables clients.
    `,
  },
  {
    title: "Développeur Junior",
    company: "Manutan",
    period: "Janv. 2020 - Août 2020",
    description:
      "Support et automatisation de tests sous Jest et Postman.",
    details: `
Contribution à la maintenance et au refactoring d’un projet ReactJS, mise en place de tests automatisés sous Jest et Postman afin de renforcer la couverture de tests et limiter les régressions.

Mission clé :
- Augmentation de la fiabilité du projet via une meilleure couverture de tests.
    `,
  },
];


const HomePage = () => {
  const [openModal, setOpenModal] = useState(false);
  const [openSkillsModal, setOpenSkillsModal] = useState(false);

  const handleOpen = () => setOpenModal(true);
  const handleClose = () => setOpenModal(false);
  const handleOpenSkills = () => setOpenSkillsModal(true);
const handleCloseSkills = () => setOpenSkillsModal(false);


  return (
    <div className="homepage-container">
      <header className="header">
        <h1 className="title">Bryan CATICHE - QA Automation Engineer</h1>
        <p className="subtitle">Spécialiste en Cypress, Playwright et Automatisation QA</p>
      </header>

      <section className="experience-section">
        <Button
          variant="contained"
          sx={{ marginTop: 3 }}
          onClick={handleOpen}
        >
          Voir mes expériences
        </Button>
      </section>

      <Button
  variant="contained"
  sx={{ marginTop: 3 }}
  onClick={handleOpenSkills}
>
  Voir mes compétences
</Button>

<Dialog open={openSkillsModal} onClose={handleCloseSkills} fullWidth maxWidth="sm">
  <DialogTitle>
    Mes Compétences
    <IconButton
      aria-label="close"
      onClick={handleCloseSkills}
      sx={{
        position: "absolute",
        right: 8,
        top: 8,
        color: (theme) => theme.palette.grey[500],
      }}
    >
      <CloseIcon />
    </IconButton>
  </DialogTitle>
  <DialogContent dividers>
    <div className="skills-container">
      {skills.map((skill, index) => (
        <Typography
          key={index}
          variant="body1"
          sx={{
            padding: "8px 0",
            borderBottom: "1px solid var(--border-color)",
            color: "var(--text-color)"
          }}
        >
          {skill}
        </Typography>
      ))}
    </div>
  </DialogContent>
</Dialog>

      <Dialog open={openModal} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>
          Mes Expériences
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Swiper
            effect="cards"
            grabCursor={true}
            centeredSlides={true}
            slidesPerView="auto"
            coverflowEffect={{
              rotate: 50,
              stretch: 0,
              depth: 100,
              modifier: 1,
              slideShadows: true,
            }}
            pagination={{ clickable: true }}
            navigation={true}
            modules={[EffectCards, Pagination, Navigation]}
            className="experienceSwiper"
          >
            {experiences.map((exp, index) => (
              <SwiperSlide key={index} style={{ width: 300 }}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    backgroundColor: "var(--card-bg)",
                    color: "var(--text-color)",
                    padding: 2,
                    boxShadow: 6,
                    borderRadius: 3,
                  }}
                >
<CardContent>
  <Typography variant="h6" gutterBottom>
    {exp.title}
  </Typography>
  <Typography className="company" variant="body2" gutterBottom>
    {exp.company} | {exp.period}
  </Typography>
  <Typography className="description" variant="body2" gutterBottom>
    {exp.description}
  </Typography>
  <Typography className="details" variant="body2" sx={{ marginTop: 2, color: "#94a3b8", lineHeight: 1.6 }}>
    {exp.details.split('Mission clé :')[0]}
  </Typography>
  <Typography variant="subtitle2" sx={{ marginTop: 2, color: "#60a5fa", fontWeight: "bold" }}>
    Mission clé :
  </Typography>
  <Typography className="details" variant="body2" sx={{ color: "#94a3b8", lineHeight: 1.6 }}>
    {exp.details.split('Mission clé :')[1]}
  </Typography>
</CardContent>
                </Card>
              </SwiperSlide>
            ))}
          </Swiper>
        </DialogContent>
      </Dialog>

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