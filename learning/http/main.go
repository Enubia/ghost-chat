package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

type ApiResponse struct {
	UserId int    `json:"userId"`
	Id     int    `json:"id"`
	Title  string `json:"title"`
	Body   string `json:"body"`
}

func main() {
	response, err := http.Get("https://jsonplaceholder.typicode.com/posts/1")

	if err != nil {
		fmt.Println("Failed to get response:", err)
		return
	}

	defer response.Body.Close()

	body, err := io.ReadAll(response.Body)

	if err != nil {
		fmt.Println("Failed to read body:", err)
		return
	}

	var loaded ApiResponse

	err = json.Unmarshal(body, &loaded)

	if err != nil {
		fmt.Println("Failed to parse json:", err)
		return
	}

	fmt.Println(loaded.UserId, loaded.Id, loaded.Title, loaded.Body)
}
