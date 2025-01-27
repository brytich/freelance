import React, { useState } from 'react';
import Card, { CardContent } from '../composants/ui/Card';
import { motion } from 'framer-motion';
import {
  FaCogs,
  FaNodeJs,
  FaReact,
  FaDocker,
  FaJenkins,
  FaGitAlt,
  FaCode,
  FaFileCode,
} from 'react-icons/fa';
import { SiCypress, SiPostgresql, SiMongodb, SiJira } from 'react-icons/si';



const skills = [
  { name: 'Cypress', icon: <SiCypress size={30} /> },
  { name: 'Playwright', icon: <FaCode size={30} /> }, // Icône alternative pour Playwright
  { name: 'JavaScript', icon: <FaCogs size={30} /> },
  { name: 'React', icon: <FaReact size={30} /> },
  { name: 'Node.js', icon: <FaNodeJs size={30} /> },
  { name: 'PostgreSQL', icon: <SiPostgresql size={30} /> },
  { name: 'MongoDB', icon: <SiMongodb size={30} /> },
  { name: 'Git', icon: <FaGitAlt size={30} /> },
  { name: 'Docker', icon: <FaDocker size={30} /> },
  { name: 'Jenkins', icon: <FaJenkins size={30} /> },
  { name: 'Gherkin', icon: <FaFileCode size={30} /> }, // Icône alternative pour Gherkin
  { name: 'Jira', icon: <SiJira size={30} /> },
];


const experiences = [
  {
    title: 'QA Automation Engineer',
    company: 'Stormshield',
    period: 'July 2023 - Present',
    description:
      'Developed and implemented test strategies and automation scripts using Cypress. Integrated Gherkin scenarios into Cypress for efficient testing.',
  },
  {
    title: 'Consultant QA Logiciels',
    company: 'TTC Testing',
    period: 'Oct. 2022 - July 2023',
    description:
      'Contributed to CI/CD pipelines with Jenkins and GitLab, ensuring software quality with automated tests in Cypress and Playwright.',
  },
  {
    title: 'Front-End Developer',
    company: 'NextRoad Engineering',
    period: 'May 2022 - Aug. 2022',
    description:
      'Enhanced application features using Vue.js and Vuetify, fixed bugs, and reviewed code for performance improvements.',
  },
];

const HomePage = () => {
  const [selectedExperience, setSelectedExperience] = useState(null);

  const toggleExperience = (index) => {
    setSelectedExperience(selectedExperience === index ? null : index);
  };

  return (
    <div className="p-6 text-white bg-gray-900 min-h-screen">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold">Bryan Cat - QA Automation Engineer</h1>
        <p className="text-xl mt-4">Specializing in Cypress, Playwright, and QA Solutions</p>
      </header>

      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">My Skills</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {skills.map((skill, index) => (
            <Card key={index} className="bg-gray-800 flex items-center justify-center">
              <CardContent>
                <div className="text-center">
                  {skill.icon}
                  <p className="mt-2 font-semibold">{skill.name}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold mb-6">Experience</h2>
        <div className="space-y-6">
          {experiences.map((experience, index) => (
            <Card
              key={index}
              className="bg-gray-800 cursor-pointer"
              onClick={() => toggleExperience(index)}
            >
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold">{experience.title}</h3>
                    <p className="text-sm text-gray-400">
                      {experience.company} | {experience.period}
                    </p>
                  </div>
                  <motion.div
                    animate={{ rotate: selectedExperience === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    ▼
                  </motion.div>
                </div>
                {selectedExperience === index && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden mt-4"
                  >
                    <p>{experience.description}</p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <footer className="text-center mt-12">
        <p>&copy; 2025 Bryan Cat - All Rights Reserved</p>
      </footer>
    </div>
  );
};

export default HomePage;
