import emailjs from 'emailjs-com';

export const sendEmail = async ({ to, subject, body }) => {
  try {
    const result = await emailjs.send(
      'service_862w13n', // Service ID
      'template_fer2yka', // Template ID
      {
        to_email: to,
        subject: subject,
        message: body,
      },
      'awbSbIRGAoz0ZZMHd' // Votre clé publique EmailJS
    );
    console.log('Email envoyé avec succès:', result);
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
  }
};
