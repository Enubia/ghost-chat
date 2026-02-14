package main

import (
	"encoding/json"
	"fmt"
	"os"
)

type AppConfig struct {
	Name    string `json:"name"`
	Version string `json:"version"`
	Port    int    `json:"port"`
}

func sdf(we int) int {
	wer := we

	return wer
}

func main() {
	appConfig := AppConfig{
		Name:    "Ghost-Chat",
		Version: "v4",
		Port:    8080,
	}

	configName := "config.json"

	bytes, err := json.MarshalIndent(appConfig, "", "  ")

	if err != nil {
		fmt.Println("Error json:", err)
		return
	}

	err = os.WriteFile(configName, bytes, 0666)

	if err != nil {
		fmt.Println("Error writing config:", err)
		return
	}

	config, err := os.ReadFile(configName)

	if err != nil {
		fmt.Println("Error reading config:", err)
		return
	}

	var loaded AppConfig

	unmarshalError := json.Unmarshal(config, &loaded)

	if unmarshalError != nil {
		fmt.Println("Error reading config:", unmarshalError)
		return
	}

	fmt.Println(loaded.Name, loaded.Version, loaded.Port)
}
