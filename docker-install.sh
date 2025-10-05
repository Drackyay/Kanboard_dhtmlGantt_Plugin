#!/bin/bash

# Docker Kanboard Plugin Installer
# Usage: ./docker-install.sh [container_name_or_id]

set -e

PLUGIN_SOURCE="$(pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_docker() {
    echo -e "${BLUE}[DOCKER]${NC} $1"
}

echo "🐳 DHTMLX Gantt Plugin Docker Installer"
echo "======================================"

# Try to auto-detect Kanboard container
CONTAINER=""
if [ $# -eq 0 ]; then
    print_status "Auto-detecting Kanboard container..."
    
    # Try to find container by name pattern
    CONTAINER=$(docker ps --format "{{.Names}}" | grep -i kanboard | head -1 2>/dev/null || true)
    
    if [ -z "$CONTAINER" ]; then
        # Try to find by image pattern
        CONTAINER=$(docker ps --format "{{.Names}} {{.Image}}" | grep -i kanboard | head -1 | awk '{print $1}' 2>/dev/null || true)
    fi
    
    if [ -z "$CONTAINER" ]; then
        print_error "No Kanboard container found automatically."
        echo ""
        echo "Available containers:"
        docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"
        echo ""
        echo "Usage: $0 [container_name_or_id]"
        exit 1
    else
        print_status "Found Kanboard container: $CONTAINER"
    fi
else
    CONTAINER="$1"
fi

# Verify container exists and is running
if ! docker ps --format "{{.Names}}" | grep -q "^${CONTAINER}$"; then
    if docker ps -a --format "{{.Names}}" | grep -q "^${CONTAINER}$"; then
        print_error "Container '$CONTAINER' exists but is not running."
        echo "Start it with: docker start $CONTAINER"
    else
        print_error "Container '$CONTAINER' not found."
        echo ""
        echo "Available containers:"
        docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"
    fi
    exit 1
fi

print_docker "Using container: $CONTAINER"

# Verify this is a Kanboard container
print_status "Verifying Kanboard installation in container..."
if ! docker exec "$CONTAINER" test -f /var/www/app/index.php; then
    print_error "This doesn't appear to be a Kanboard container."
    print_error "Expected to find /var/www/app/index.php but it's missing."
    exit 1
fi

print_status "✅ Kanboard installation verified"

# Create plugins directory if it doesn't exist
print_status "Ensuring plugins directory exists..."
docker exec "$CONTAINER" mkdir -p /var/www/app/plugins

# Check if plugin already exists
if docker exec "$CONTAINER" test -d /var/www/app/plugins/DhtmlGantt; then
    print_warning "Plugin already exists in container"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Installation cancelled"
        exit 0
    fi
    print_status "Removing existing plugin..."
    docker exec "$CONTAINER" rm -rf /var/www/app/plugins/DhtmlGantt
fi

# Copy plugin files
print_status "📁 Copying plugin files to container..."
docker cp "$PLUGIN_SOURCE" "$CONTAINER:/var/www/app/plugins/DhtmlGantt"

# Remove development files from container
print_status "🧹 Cleaning up development files..."
docker exec "$CONTAINER" rm -f /var/www/app/plugins/DhtmlGantt/docker-install.sh 2>/dev/null || true
docker exec "$CONTAINER" rm -f /var/www/app/plugins/DhtmlGantt/install.sh 2>/dev/null || true
docker exec "$CONTAINER" rm -f /var/www/app/plugins/DhtmlGantt/install.bat 2>/dev/null || true
docker exec "$CONTAINER" rm -rf /var/www/app/plugins/DhtmlGantt/.git 2>/dev/null || true

# Set proper permissions
print_status "🔐 Setting permissions..."

# Detect the web server user (www-data or nginx)
WEB_USER="www-data"
if docker exec "$CONTAINER" id nginx >/dev/null 2>&1; then
    WEB_USER="nginx"
fi

print_status "Using web server user: $WEB_USER"
docker exec "$CONTAINER" chown -R "$WEB_USER:$WEB_USER" /var/www/app/plugins/DhtmlGantt
docker exec "$CONTAINER" chmod -R 755 /var/www/app/plugins/DhtmlGantt

# Clear Kanboard cache
print_status "🧹 Clearing Kanboard cache..."
docker exec "$CONTAINER" rm -rf /var/www/app/data/cache/* 2>/dev/null || true

# Verify installation
print_status "✅ Verifying installation..."

REQUIRED_FILES=(
    "Plugin.php"
    "Controller/GanttController.php"
    "Formatter/GanttDataFormatter.php"
    "Template/project_gantt/show.php"
    "Assets/dhtmlxgantt.js"
    "Assets/dhtmlxgantt.css"
)

for file in "${REQUIRED_FILES[@]}"; do
    if ! docker exec "$CONTAINER" test -f "/var/www/app/plugins/DhtmlGantt/$file"; then
        print_error "Required file missing: $file"
        exit 1
    fi
done

# Check DHTMLX library size
JS_SIZE=$(docker exec "$CONTAINER" stat -c%s /var/www/app/plugins/DhtmlGantt/Assets/dhtmlxgantt.js 2>/dev/null || echo "0")
if [ "$JS_SIZE" -lt 100000 ]; then
    print_warning "DHTMLX JavaScript library seems small ($JS_SIZE bytes). Make sure you have the actual library."
fi

# Get container port info
PORTS=$(docker port "$CONTAINER" 2>/dev/null || echo "No port mappings found")
WEB_URL=""
if echo "$PORTS" | grep -q "80/tcp"; then
    HOST_PORT=$(echo "$PORTS" | grep "80/tcp" | cut -d: -f2)
    WEB_URL="http://localhost:$HOST_PORT"
elif echo "$PORTS" | grep -q "8080/tcp"; then
    HOST_PORT=$(echo "$PORTS" | grep "8080/tcp" | cut -d: -f2)
    WEB_URL="http://localhost:$HOST_PORT"
else
    WEB_URL="http://localhost (check your port mapping)"
fi

print_status "🎉 Plugin installation completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Open your Kanboard web interface: $WEB_URL"
echo "2. Login as administrator"
echo "3. Navigate to: Settings → Plugins"
echo "4. Look for 'DHtmlX Gantt' and click 'Install'"
echo "5. Test by creating a project and accessing the Gantt chart"
echo ""
echo "🔍 Verification Commands:"
echo "   List plugins: docker exec $CONTAINER ls -la /var/www/app/plugins/"
echo "   Check logs:   docker logs $CONTAINER"
echo "   Test API:     curl \"$WEB_URL/gantt/json/1\""
echo ""
echo "📖 Documentation:"
echo "   - Docker guide: DOCKER_INSTALLATION.md"
echo "   - Full README:  README.md"
echo ""
print_status "Installation complete! 🚀" 