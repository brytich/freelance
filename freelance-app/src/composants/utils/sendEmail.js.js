import emailjs from 'emailjs-com';

// Initialisation d'EmailJS (à faire une seule fois au début de l'application)
emailjs.init('awbSbIRGAoz0ZZMHd'); // Clé publique

export const sendEmail = async ({ to, subject, body }) => {
  try {
    console.log(`📧 Tentative d'envoi d'email à ${to} avec le sujet "${subject}"`);

    const result = await emailjs.send(
      'service_862w13n', // Service ID
      'template_fer2yka', // Template ID
      {
        to_email: to, // Destination
        subject: subject, // Sujet
        message: body, // Contenu
      },
      'awbSbIRGAoz0ZZMHd' // Clé publique
    );

    console.log('✅ Email envoyé avec succès :', result);
    return result;
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email :', error);
    throw new Error("L'envoi de l'email a échoué.");
  }
};
