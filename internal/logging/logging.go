package logging

import (
	"errors"
	"io"
	"io/fs"
	"log/slog"
	"os"
	"path/filepath"
	"strconv"
	"sync"
)

const (
	FileName    = "ghost-chat.log"
	maxFileSize = 1 << 20
	maxFiles    = 3
)

var dirOverride string

func Dir() (string, error) {
	if dirOverride != "" {
		return dirOverride, nil
	}

	configDir, err := os.UserConfigDir()

	if err != nil {
		return "", err
	}

	return filepath.Join(configDir, "ghost-chat", "logs"), nil
}

func Setup(dev bool) (io.Closer, error) {
	dir, err := Dir()

	if err != nil {
		return nil, err
	}

	if err := os.MkdirAll(dir, 0o700); err != nil {
		return nil, err
	}

	file, err := newRotatingFile(filepath.Join(dir, FileName), maxFileSize, maxFiles)

	if err != nil {
		return nil, err
	}

	var out io.Writer = file

	if dev {
		out = io.MultiWriter(file, os.Stderr)
	}

	slog.SetDefault(slog.New(slog.NewTextHandler(out, nil)))

	return file, nil
}

func Tail(maxBytes int) (string, error) {
	dir, err := Dir()

	if err != nil {
		return "", err
	}

	file, err := os.Open(filepath.Join(dir, FileName))

	if errors.Is(err, fs.ErrNotExist) {
		return "", nil
	}

	if err != nil {
		return "", err
	}

	defer file.Close()

	info, err := file.Stat()

	if err != nil {
		return "", err
	}

	size := info.Size()

	if maxBytes <= 0 || size == 0 {
		return "", nil
	}

	start := max(size-int64(maxBytes), 0)
	buf := make([]byte, size-start)

	if _, err := file.ReadAt(buf, start); err != nil && !errors.Is(err, io.EOF) {
		return "", err
	}

	if start > 0 {
		prev := make([]byte, 1)

		if _, err := file.ReadAt(prev, start-1); err != nil {
			return "", err
		}

		if prev[0] != '\n' {
			idx := indexByte(buf, '\n')

			if idx < 0 {
				return "", nil
			}

			buf = buf[idx+1:]
		}
	}

	return string(buf), nil
}

func indexByte(b []byte, c byte) int {
	for i, v := range b {
		if v == c {
			return i
		}
	}

	return -1
}

type rotatingFile struct {
	mu      sync.Mutex
	path    string
	maxSize int64
	keep    int
	file    *os.File
	size    int64
}

func newRotatingFile(path string, maxSize int64, keep int) (*rotatingFile, error) {
	r := &rotatingFile{path: path, maxSize: maxSize, keep: keep}

	if err := r.open(); err != nil {
		return nil, err
	}

	return r, nil
}

func (r *rotatingFile) open() error {
	file, err := os.OpenFile(r.path, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0o600)

	if err != nil {
		return err
	}

	info, err := file.Stat()

	if err != nil {
		file.Close()

		return err
	}

	r.file = file
	r.size = info.Size()

	return nil
}

func (r *rotatingFile) Write(p []byte) (int, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	if r.size > 0 && r.size+int64(len(p)) > r.maxSize {
		if err := r.rotate(); err != nil {
			return 0, err
		}
	}

	n, err := r.file.Write(p)
	r.size += int64(n)

	return n, err
}

func (r *rotatingFile) rotate() error {
	if err := r.file.Close(); err != nil {
		return err
	}

	for i := r.keep - 1; i >= 1; i-- {
		from := r.path
		if i > 1 {
			from = r.numbered(i - 1)
		}

		if err := os.Rename(from, r.numbered(i)); err != nil && !errors.Is(err, fs.ErrNotExist) {
			return err
		}
	}

	return r.open()
}

func (r *rotatingFile) numbered(i int) string {
	return r.path + "." + strconv.Itoa(i)
}

func (r *rotatingFile) Close() error {
	r.mu.Lock()
	defer r.mu.Unlock()

	return r.file.Close()
}
