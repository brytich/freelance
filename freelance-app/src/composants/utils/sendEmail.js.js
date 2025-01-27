import emailjs from 'emailjs-com';

export const sendEmail = async ({ to, subject, body }) => {
  try {
    const result = await emailjs.send(
      'service_862w13n', // Remplacez par votre Service ID
      'template_fer2yka', // Remplacez par votre Template ID
      {
        to_email: to, // Destination
        subject: subject, // Sujet
        message: body, // Contenu
      },
      'awbSbIRGAoz0ZZMHd' // Remplacez par votre clé publique
    );
    console.log('Email envoyé avec succès :', result);
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'e-mail :', error.message);
  }
};
