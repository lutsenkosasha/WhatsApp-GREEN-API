import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { TextField, Box, Typography, Paper, List, ListItem, ListItemText, IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

function App() {
  const [idInstance, setIdInstance] = useState("");
  const [apiTokenInstance, setApiTokenInstance] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);

  const handleSendMessage = async () => {
    try {
      await axios.post('http://localhost:5000/sendMessage', {
        idInstance,
        apiTokenInstance,
        phoneNumber,
        message,
      });
      setChatMessages((prevMessages) => [
        ...prevMessages,
        { text: message, from: 'me' },
      ]);
      setMessage('');
    } catch (error) {
      console.error('Ошибка при отправке сообщения', error);
    }
  };

  const handleReceiveMessages = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/receiveMessage', {
        params: {
          idInstance,
          apiTokenInstance,
        },
      });

      console.log('Ответ при получении сообщений:', response.data);

      if (response.data && response.data.message) {
        const receivedMessage = response.data.message;

        if (!chatMessages.some((msg) => msg.text === receivedMessage)) {
          setChatMessages((prevMessages) => [
            ...prevMessages,
            { text: receivedMessage, from: 'recipient' },
          ]);
        }
      }
    } catch (error) {
      console.error('Ошибка при получении сообщений', error);
    }
  }, [idInstance, apiTokenInstance, chatMessages]);
  
  useEffect(() => {
    const interval = setInterval(handleReceiveMessages, 5000);
    return () => clearInterval(interval);
  }, [handleReceiveMessages]);

  return (
    <Box sx={{ width: "100%", maxWidth: 600, margin: "0 auto", padding: 2 }}>
      <Typography variant="h4" align="center" gutterBottom>
        WhatsApp Chat
      </Typography>
      <Paper elevation={3} sx={{ padding: 2 }}>
        <TextField
          label="ID Instance"
          variant="outlined"
          fullWidth
          margin="normal"
          value={idInstance}
          onChange={(e) => setIdInstance(e.target.value)}
        />
        <TextField
          label="API Token"
          variant="outlined"
          fullWidth
          margin="normal"
          value={apiTokenInstance}
          onChange={(e) => setApiTokenInstance(e.target.value)}
        />
        <TextField
          label="Phone Number"
          variant="outlined"
          fullWidth
          margin="normal"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
      </Paper>

      <Box sx={{ display: "flex", flexDirection: "column", marginTop: 2 }}>
        <List sx={{ overflowY: "auto", maxHeight: 300 }}>
          {chatMessages.map((msg, index) => (
            <ListItem key={index} sx={{ justifyContent: msg.from === "me" ? "flex-end" : "flex-start" }}>
              <ListItemText
                sx={{
                  backgroundColor: msg.from === "me" ? "#DCF8C6" : "#fff",
                  borderRadius: 1,
                  padding: 1,
                  maxWidth: "70%",
                }}
                primary={msg.text}
              />
            </ListItem>
          ))}
        </List>
        <Box sx={{ display: "flex", marginTop: 2 }}>
          <TextField
            label="Type a message"
            variant="outlined"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            sx={{ marginRight: 1 }}
          />
          <IconButton color="primary" onClick={handleSendMessage}>
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}

export default App;