import nodemailer from 'nodemailer';
import _var from "../global/_var.js"

const transporter = nodemailer.createTransport({
  service: 'gmail', // O tu proveedor de preferencia
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendSurgeryNotification(email, pacienteNombre) {
  const mailOptions = {
    from: '"Mundo Implantes" <tu-correo@gmail.com>',
    to: email,
    subject: 'Programación de Cirugia - Mundo Implantes',
    text: `Estimado reciba un cordial saludo, el siguiente es un recordatorio para el registro del Reporte de Instrumentación del cliente: ${pacienteNombre}. Para ello ingrese al link de la app: https://proyecto-boq.vercel.app con sus respectivas credenciales`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Error enviando correo a ${email}:`, error);
  }
}