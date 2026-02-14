package main

import (
	"fmt"

	"github.com/gorilla/websocket"
)

func main() {
	conn, _, err := websocket.DefaultDialer.Dial("wss://ws.postman-echo.com/raw", nil)

	if err != nil {
		fmt.Println("Failed to connect:", err)
		return
	}

	defer conn.Close()
	
	err = conn.WriteMessage(websocket.TextMessage, []byte("sample text"))

	if err != nil {
		fmt.Println("Failed to write message:", err)
		return
	}

	_, message, err := conn.ReadMessage()

	if err != nil {
		fmt.Println("Failed to read message:", err)
		return
	}

	fmt.Println(string(message))
}
