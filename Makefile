# KaelyTech POS — Build for all platforms
# Requires: Go 1.22+, Node 20+, Wails CLI v2
# Install Wails: go install github.com/wailsapp/wails/v2/cmd/wails@latest

VERSION := 1.0.0
BUILD_DIR := build/bin
DIST_DIR := dist

.PHONY: all clean deps windows linux mac dev

all: deps windows linux mac

deps:
	cd frontend && npm install

dev:
	wails dev

# Windows x64 — produces .exe
windows: deps
	@echo "=== Building Windows x64 ==="
	wails build -platform windows/amd64 -o kaely-pos.exe
	@mkdir -p $(DIST_DIR)
	@cp $(BUILD_DIR)/kaely-pos.exe $(DIST_DIR)/kaely-pos-$(VERSION)-windows-x64.exe
	@echo "  Output: $(DIST_DIR)/kaely-pos-$(VERSION)-windows-x64.exe"

# Linux x64 — produces binary
linux: deps
	@echo "=== Building Linux x64 ==="
	wails build -platform linux/amd64
	@mkdir -p $(DIST_DIR)
	@cp $(BUILD_DIR)/kaely-pos $(DIST_DIR)/kaely-pos-$(VERSION)-linux-x64
	@chmod +x $(DIST_DIR)/kaely-pos-$(VERSION)-linux-x64
	@echo "  Output: $(DIST_DIR)/kaely-pos-$(VERSION)-linux-x64"

# macOS Universal (Intel + Apple Silicon)
mac: deps
	@echo "=== Building macOS Universal ==="
	wails build -platform darwin/universal
	@mkdir -p $(DIST_DIR)
	@cp -r $(BUILD_DIR)/kaely-pos.app $(DIST_DIR)/kaely-pos-$(VERSION)-macos.app 2>/dev/null || true
	@echo "  Output: $(DIST_DIR)/kaely-pos-$(VERSION)-macos.app"

clean:
	rm -rf $(BUILD_DIR) $(DIST_DIR) frontend/dist frontend/node_modules
