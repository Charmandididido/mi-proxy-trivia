import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
    // Permitir solo peticiones POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
        const { tematica, cantidad } = req.body;

        if (!tematica) {
            return res.status(400).json({ error: 'Falta la temática' });
        }

        // Leemos la clave desde las variables secretas de Vercel
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        const model = genAI.getGenerativeModel({ 
            model: 'gemini-1.5-flash',
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `Genera un cuestionario de trivia sobre "${tematica}". 
        Devuelve estrictamente un array JSON de ${cantidad || 10} objetos con este formato exacto:
        [
          {
            "Enunciado": "Texto de la pregunta",
            "Opciones": ["Opción A", "Opción B", "Opción C", "Opción D"],
            "RespuestaCorrecta": 1
          }
        ]
        Donde RespuestaCorrecta es el índice (1 a 4) de la opción válida.`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        const preguntasJSON = JSON.parse(responseText);
        return res.status(200).json(preguntasJSON);

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
}
