package main

import (
	"context"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

// ListVideoFiles recursively lists all video files in a given directory
func (a *App) ListVideoFiles(directory string) ([]string, error) {
	var videoFiles []string
	videoExtensions := map[string]bool{
		".mp4": true, ".mkv": true, ".avi": true,
		".mov": true, ".wmv": true, ".flv": true,
		".webm": true,
	}

	err := filepath.Walk(directory, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if !info.IsDir() {
			ext := strings.ToLower(filepath.Ext(path))
			if videoExtensions[ext] {
				videoFiles = append(videoFiles, path)
			}
		}
		return nil
	})

	return videoFiles, err
}

// StreamVideo handles streaming a video file in chunks
func (a *App) StreamVideo(w http.ResponseWriter, r *http.Request) {
	videoPath := r.URL.Query().Get("path")
	file, err := os.Open(videoPath)
	if err != nil {
		http.Error(w, "File not found", http.StatusNotFound)
		return
	}
	defer file.Close()

	fileStat, err := file.Stat()
	if err != nil {
		http.Error(w, "Could not obtain file information", http.StatusInternalServerError)
		return
	}

	fileSize := fileStat.Size()
	rangeHeader := r.Header.Get("Range")

	if rangeHeader == "" {
		http.Error(w, "Range header missing", http.StatusBadRequest)
		return
	}

	rangeParts := strings.Split(rangeHeader, "=")
	if len(rangeParts) != 2 {
		http.Error(w, "Invalid range header format", http.StatusBadRequest)
		return
	}

	rangeVal := strings.Split(rangeParts[1], "-")
	start, err := strconv.ParseInt(rangeVal[0], 10, 64)
	if err != nil {
		http.Error(w, "Invalid start value", http.StatusBadRequest)
		return
	}

	var end int64
	if len(rangeVal) == 2 && rangeVal[1] != "" {
		end, err = strconv.ParseInt(rangeVal[1], 10, 64)
		if err != nil {
			http.Error(w, "Invalid end value", http.StatusBadRequest)
			return
		}
	} else {
		end = fileSize - 1
	}

	if start > end || end >= fileSize {
		http.Error(w, "Invalid range", http.StatusRequestedRangeNotSatisfiable)
		return
	}

	w.Header().Set("Content-Type", "video/mp4") // Adjust MIME type if necessary
	w.Header().Set("Content-Length", strconv.FormatInt(end-start+1, 10))
	w.Header().Set("Content-Range", "bytes "+strconv.FormatInt(start, 10)+"-"+strconv.FormatInt(end, 10)+"/"+strconv.FormatInt(fileSize, 10))
	w.WriteHeader(http.StatusPartialContent)

	file.Seek(start, io.SeekStart)
	buffer := make([]byte, 1024*1024) // 1MB buffer
	for {
		bytesToRead := int64(len(buffer))
		if end-start+1 < bytesToRead {
			bytesToRead = end - start + 1
		}

		bytesRead, err := file.Read(buffer[:bytesToRead])
		if err != nil && err != io.EOF {
			log.Println("Error reading file:", err)
			break
		}

		if bytesRead == 0 {
			break
		}

		w.Write(buffer[:bytesRead])
		start += int64(bytesRead)

		if start > end {
			break
		}
	}
}

type TMDbResponse struct {
	Results []struct {
		Title        string `json:"title"`          // For movies
		Name         string `json:"name"`           // For TV shows
		ReleaseDate  string `json:"release_date"`   // For movies
		FirstAirDate string `json:"first_air_date"` // For TV shows
		MediaType    string `json:"media_type"`     // Type of media (movie or tv)
	} `json:"results"`
}

func (a *App) SearchTMDB(searchTitle string) (string, error) {
	// Get the API key from environment variable
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	apiKey := os.Getenv("TMDB_API_KEY")
	if apiKey == "" {
		log.Fatal("API key not found in environment variables")
	}

	apiUrl := "https://api.themoviedb.org/3/search/multi"

	// Prepare the query parameters
	params := url.Values{}
	params.Add("api_key", apiKey)
	params.Add("query", searchTitle)

	// Make the HTTP request
	resp, err := http.Get(fmt.Sprintf("%s?%s", apiUrl, params.Encode()))
	if err != nil {
		return "", fmt.Errorf("error making the request: %v", err)
	}
	defer resp.Body.Close()

	// Check for successful response
	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("error: received non-200 response code: %s", resp.Status)
	}

	// Read the response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("error reading the response body: %v", err)
	}

	// Convert the response body to a string and return it
	return string(body), nil
}

func (a *App) SelectFolder(ctx context.Context) (string, error) {
	// Use Wails to open a directory picker dialog
	selectedFolder, err := runtime.OpenDirectoryDialog(ctx, runtime.OpenDialogOptions{
		Title: "Select a Folder",
	})

	if err != nil {
		return "", fmt.Errorf("Error selecting folder: %v", err)
	}

	if selectedFolder == "" {
		return "", fmt.Errorf("No folder was selected")
	}

	// Return the selected folder path
	fmt.Println("Folder path:", selectedFolder)
	return selectedFolder, nil
}
