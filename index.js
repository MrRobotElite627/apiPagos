const express = require('express');
const admin = require('firebase-admin');

// Inicializa la app de Firebase con tus credenciales
require('dotenv').config();

const serviceAccount = {
    "type": "service_account",
    "project_id": "controller-b0871",
    "private_key_id": "d0e8036990e3a1706e5835f53de144278808bb87",
    "private_key": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Reemplaza el salto de línea
    "client_email": "firebase-adminsdk-x6sg2@controller-b0871.iam.gserviceaccount.com",
    "client_id": "108718797368728573775",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-x6sg2%40controller-b0871.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
};

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://controller-b0871.firebaseio.com' // Asegúrate de que sea el correcto
});

const db = admin.firestore();
const app = express();
const port = process.env.PORT || 3000; // Usa el puerto proporcionado por Render

// Ruta para obtener datos de la colección "datos" y el documento "app" si el idAccess coincide
app.get('/datosApp/:idAccess', async (req, res) => { // Asegúrate de que idAccess esté en la URL
    const { idAccess } = req.params;  // Extraer el idAccess de la URL

    try {
        // Obtener el documento "app" de la colección "datos"
        const docRef = db.collection('datos').doc('app');
        const doc = await docRef.get();

        if (doc.exists) {
            const data = doc.data();  // Obtener los datos del documento

            // Verificar si el idAccess en los datos coincide con el idAccess pasado en la URL
            if (data.idAccess === idAccess) {
                const coleccion1Snapshot = await db.collection('planes').get();
                const coleccion2Snapshot = await db.collection('anuncios').get();

                // Extraer los datos de las colecciones
                const coleccion1Data = coleccion1Snapshot.docs.map(doc => doc.data());
                const coleccion2Data = coleccion2Snapshot.docs.map(doc => doc.data());


                res.json({
                    datosApp: data,
                    planes: coleccion1Data,
                    anuncios: coleccion2Data
                });
            } else {
                res.status(403).send('Acceso denegado: idAccess no coincide.');
            }
        } else {
            res.status(404).send('No se encontró el documento.');
        }
    } catch (error) {
        console.error('Error obteniendo el documento:', error);
        res.status(500).send('Error al obtener los datos');
    }
});

// Servidor escucha en el puerto proporcionado por el entorno
app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`); // Cambié la URL de localhost
});
