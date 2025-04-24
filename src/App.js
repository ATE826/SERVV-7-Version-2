import React, { useState, useEffect, useRef } from 'react';
import './App.css'; // Импортируем стили, которые мы обновили

function App() {
  // Состояние для хранения списка сообщений
  const [messages, setMessages] = useState([]);
  // Состояние для хранения текущего введенного сообщения
  const [inputMessage, setInputMessage] = useState('');
  // Ref для хранения экземпляра WebSocket
  const ws = useRef(null);

  // useEffect для установки WebSocket соединения при монтировании компонента
  useEffect(() => {
    // Создаем новый WebSocket объект. Подключаемся к нашему Go бэкенду по порту 8080.
    // Обрати внимание на протокол ws:// (или wss:// для защищенного соединения)
    ws.current = new WebSocket('ws://localhost:8080/ws');

    // Обработчик события открытия соединения
    ws.current.onopen = () => {
      console.log('WebSocket connected');
      // Добавляем системное сообщение об установке соединения
      setMessages(prevMessages => [...prevMessages, { text: '[СИСТЕМА] Соединение с Квантовым Каналом установлено.' }]);
    };

    // Обработчик события получения сообщения
    ws.current.onmessage = (event) => {
      console.log('Message from server:', event.data);
      try {
        // Парсим полученное сообщение (ожидаем JSON)
        const message = JSON.parse(event.data);
        // Добавляем сообщение в список сообщений
        setMessages(prevMessages => [...prevMessages, message]);
      } catch (error) {
        console.error('Error parsing message:', error);
        // Если не удалось распарсить JSON, просто добавим сырой текст как системное сообщение
        setMessages(prevMessages => [...prevMessages, { text: `[ОШИБКА ПАРСИНГА] ${event.data}` }]);
      }
    };

    // Обработчик события закрытия соединения
    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
      // Добавляем системное сообщение о разрыве соединения
      setMessages(prevMessages => [...prevMessages, { text: '[СИСТЕМА] Соединение с Квантовым Каналом разорвано.' }]);
    };

     // Обработчик события ошибки
    ws.current.onerror = (error) => {
        console.error('WebSocket Error:', error);
        // Добавляем системное сообщение об ошибке
         setMessages(prevMessages => [...prevMessages, { text: `[СИСТЕМА ОШИБКА] Соединение: ${error.message}` }]);
    };


    // Функция очистки при размонтировании компонента
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []); // Пустой массив зависимостей означает, что эффект запустится только один раз при монтировании

  // Обработчик изменения текста в поле ввода
  const handleInputChange = (event) => {
    setInputMessage(event.target.value);
  };

  // Обработчик отправки сообщения
  const handleSendMessage = () => {
    // Проверяем, что сообщение не пустое и WebSocket готов
    if (inputMessage.trim() === '' || !ws.current || ws.current.readyState !== WebSocket.OPEN) {
      console.warn('Сообщение пустое или Квантовый Канал не готов.');
      // Опционально: добавить сообщение пользователю в UI
      // setMessages(prevMessages => [...prevMessages, { text: '[ПРЕДУПРЕЖДЕНИЕ] Канал не готов или сообщение пусто.' }]);
      return;
    }

    // Создаем объект сообщения
    // В реальном приложении здесь можно добавить имя отправителя, время и т.д.
    const messageToSend = { text: inputMessage };

    // Отправляем сообщение на сервер через WebSocket
    ws.current.send(JSON.stringify(messageToSend));

    // Очищаем поле ввода после отправки
    setInputMessage('');
  };

  // Обработчик нажатия Enter в поле ввода
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Ref для автоматической прокрутки к последнему сообщению
   const messagesEndRef = useRef(null);

   // useEffect для прокрутки при каждом обновлении списка сообщений
   useEffect(() => {
     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
   }, [messages]); // Зависимость от массива messages

  return (
    <div className="App">
      <header className="App-header">
        {/* Тематический заголовок чата */}
        <h1>Межпланетный Квантовый Связной Канал</h1>
      </header>
      <div className="chat-container">
        <div className="messages-list">
          {/* Отображаем список сообщений */}
          {messages.map((msg, index) => (
            // Используем index как key, но в реальных приложениях лучше использовать уникальный ID сообщения
            <div key={index} className="message">
              {msg.text}
            </div>
          ))}
           {/* Пустой div для автоматической прокрутки */}
           <div ref={messagesEndRef} />
        </div>
        <div className="input-area">
          {/* Поле ввода сообщения */}
          <input
            type="text"
            value={inputMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Передать сообщение..." // Тематический плейсхолдер
          />
          {/* Кнопка отправки */}
          <button onClick={handleSendMessage}>Передать</button> {/* Тематический текст кнопки */}
        </div>
      </div>
    </div>
  );
}

export default App;