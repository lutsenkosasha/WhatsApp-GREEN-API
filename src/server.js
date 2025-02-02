const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

let lastReceivedMessageId = null;
let messageQueue = [];

// Функция для получения сообщений с GREEN-API
async function fetchMessages(idInstance, apiTokenInstance) {
  try {
    const response = await axios.get(
      `https://1103.api.green-api.com/waInstance${idInstance}/receiveNotification/${apiTokenInstance}`,
      { params: { receiveTimeout: 10 } }
    );

    if (response.data && response.data.body) {
      const { typeWebhook, messageData, receiptId } = response.data.body;

      if (typeWebhook === 'incomingMessageReceived' && lastReceivedMessageId !== receiptId) {
        const message = messageData.textMessageData.textMessage;
        console.log(`Получено сообщение: ${message}`);

        messageQueue.push(message);

        lastReceivedMessageId = receiptId;
      }
    }
  } catch (error) {
    console.error('Ошибка при получении сообщений:', error);
  }
}

// таймер для получения сообщений
setInterval(() => {
  const idInstance = '1103184885';
  const apiTokenInstance = 'ab06f2d982984d2d949477979e9c704218c8c6c0e9f34ec09d';
  fetchMessages(idInstance, apiTokenInstance);
}, 2000);


// Проксируем запросы для отправки сообщений
app.post('/sendMessage', async (req, res) => {
  const { idInstance, apiTokenInstance, phoneNumber, message } = req.body;

  try {
    const response = await axios.post(
      `https://1103.api.green-api.com/waInstance${idInstance}/sendMessage/${apiTokenInstance}`,
      {
        chatId: `${phoneNumber}@c.us`,
        message,
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Ошибка при отправке сообщения:', error);
    res.status(500).send('Ошибка при отправке сообщения');
  }
});

// Проксируем запросы для получения сообщений
app.get('/receiveMessage', async (req, res) => {
  try {
    if (messageQueue.length > 0) {
      const message = messageQueue.shift();
      res.json({ message });

      if (messageQueue.length === 0) {
        lastReceivedMessageId = null;
      }
    } else {
      res.status(200).json({});
    }
  } catch (error) {
    console.error('Ошибка при отправке сообщений на клиент:', error);
    res.status(500).json({ error: 'Ошибка при отправке сообщений на клиент' });
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});