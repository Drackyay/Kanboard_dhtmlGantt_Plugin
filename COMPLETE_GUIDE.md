# DHTMLX Gantt Plugin for Kanboard - Complete Guide

## Table of Contents
1. [Overview](#overview)
2. [Features](#features)
3. [Installation (Docker)](#installation-docker)
4. [JSON API Documentation](#json-api-documentation)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)
7. [Technical Implementation](#technical-implementation)

---

## Overview

This plugin integrates DHTMLX Gantt charts into Kanboard, providing USC student teams with professional project visualization capabilities. It transforms Kanboard's task management into an interactive Gantt chart with dependency tracking.

**Key Achievement:** Custom JSON API endpoint that bypasses Kanboard's complex JSON-RPC API and serves data in the exact format DHTMLX Gantt expects.

---

## Features

### User-Facing Features
- ✅ **Interactive Gantt Chart** - Visual timeline of all project tasks
- ✅ **Task Dependencies** - Arrow visualization of task relationships
- ✅ **Progress Tracking** - Visual progress bars for each task
- ✅ **Multiple View Modes** - Daily, Weekly, Monthly, Quarterly, Yearly
- ✅ **Zoom Controls** - Zoom in/out and fit to screen
- ✅ **Real-time Updates** - Integrated with Kanboard's task system

### Technical Features
- ✅ **Clean JSON API** - `/gantt/json/:project_id` endpoint
- ✅ **Smart Date Handling** - Handles missing dates intelligently
- ✅ **Multiple Progress Methods** - Time-based, score-based, column-based
- ✅ **Docker Compatible** - Works in Docker containers
- ✅ **CDN Integration** - Uses DHTMLX Gantt CDN for easy deployment

---

## Installation (Docker)

### Prerequisites
- Docker-based Kanboard installation
- Admin access to Kanboard
- Terminal access to Docker host

### Automated Installation

1. **Run the installation script:**
   ```bash
   ./docker-install.sh
   ```
   The script will auto-detect your Kanboard container.

2. **Or specify container name:**
   ```bash
   ./docker-install.sh kanboard
   ```

### Manual Installation

1. **Copy plugin to container:**
   ```bash
   docker cp . CONTAINER_NAME:/var/www/app/plugins/DhtmlGantt
   ```

2. **Fix permissions:**
   ```bash
   docker exec CONTAINER_NAME chown -R nginx:nginx /var/www/app/plugins/DhtmlGantt
   ```

3. **Restart container:**
   ```bash
   docker restart CONTAINER_NAME
   ```

### Activation in Kanboard

1. **Login to Kanboard:** http://localhost:8080
2. **Navigate to:** Settings → Plugins
3. **Find:** "DHtmlX Gantt"
4. **Click:** "Install" button
5. **Verify:** Status shows "Enabled"

---

## JSON API Documentation

### Endpoint Details

**URL:** `/gantt/json/:project_id`  
**Method:** GET  
**Authentication:** Required (Kanboard session)  
**Response:** JSON in DHTMLX Gantt format

### Response Format

```json
{
  "data": [
    {
      "id": 1,
      "text": "Task Name",
      "start_date": "2025-09-29",
      "duration": 5,
      "progress": 0.4,
      "parent": 0
    }
  ],
  "links": [
    {
      "id": 1,
      "source": 1,
      "target": 2,
      "type": "0"
    }
  ]
}
```

### Data Object Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `id` | Integer | Kanboard task ID (unique identifier) | `1` |
| `text` | String | Task title/name | `"Design Phase"` |
| `start_date` | String | Task start date (YYYY-MM-DD format) | `"2025-09-29"` |
| `duration` | Integer | Task length in days (minimum 1) | `5` |
| `progress` | Float | Completion percentage (0.0 to 1.0) | `0.4` |
| `parent` | Integer | Parent task ID (0 for root level) | `0` |

### Links Object Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `id` | Integer | Unique link identifier | `1` |
| `source` | Integer | Task ID that must finish first | `1` |
| `target` | Integer | Task ID that depends on source | `2` |
| `type` | String | Dependency type ("0" = Finish-to-Start) | `"0"` |

### Data Transformation Logic

#### Date Handling
1. **Both dates available:** Uses actual dates and calculates duration
2. **Only due date:** Calculates start as 1 day before due date
3. **No dates:** Uses current date with 1-day duration
4. **Format:** Always YYYY-MM-DD (ISO date format)

#### Progress Calculation (Priority Order)
1. **Time-based:** `time_spent / time_estimated` (most accurate)
2. **Score-based:** `kanboard_score / 100` (manual scoring)
3. **Column-based:** Workflow position (estimated)
4. **Default:** 0.0 (no progress)

#### Task Dependencies
- **Kanboard "blocks" (Link ID 2)** → DHTMLX type "0" (Finish-to-Start)
- **Kanboard "is blocked by" (Link ID 3)** → DHTMLX type "0" (reversed)
- **Other link types** → Ignored for clean visualization

---

## Testing

### Browser Testing (Easiest)

1. **Login to Kanboard:** http://localhost:8080
2. **Go to any project**
3. **Note the project ID** in the URL (e.g., `/project/1`)
4. **Test JSON endpoint:** http://localhost:8080/gantt/json/1
5. **Test Gantt page:** http://localhost:8080/gantt/show/1

### JavaScript Console Testing

1. **Open Developer Tools** (F12)
2. **Go to Console tab**
3. **Run:**
   ```javascript
   fetch('/gantt/json/1')
     .then(response => response.json())
     .then(data => console.log('Gantt Data:', data));
   ```

### Expected JSON Response

**Empty project:**
```json
{"data": [], "links": []}
```

**Project with tasks:**
```json
{
  "data": [
    {"id": 1, "text": "Task A", "start_date": "2025-09-28", "duration": 5, "progress": 0.4, "parent": 0},
    {"id": 2, "text": "Task B", "start_date": "2025-10-01", "duration": 3, "progress": 0.2, "parent": 0}
  ],
  "links": [
    {"id": 1, "source": 1, "target": 2, "type": "0"}
  ]
}
```

---

## Troubleshooting

### Issue: Gantt Link Redirects Back

**Symptom:** Clicking "Gantt chart" in sidebar redirects to previous page

**Solution:**
1. Hard refresh browser (Ctrl+F5 or Cmd+Shift+R)
2. Verify plugin is installed (Settings → Plugins)
3. Try direct URL: `http://localhost:8080/gantt/show/PROJECT_ID`

### Issue: "Action not implemented" Error

**Symptom:** Error message when accessing Gantt chart

**Solution:** 
- Plugin uses direct routes (`/gantt/show/:project_id`)
- Don't use old controller syntax URLs
- Use the sidebar link or direct route

### Issue: JSON Endpoint Returns Empty Data

**Symptoms:** `{"data": [], "links": []}`

**Causes:**
- Project has no active tasks
- User lacks project permissions
- Tasks are all closed/archived

**Solution:**
- Add tasks with start/due dates in Kanboard
- Ensure tasks are in "active" status
- Verify user has project access

### Issue: Template Caching

**Symptom:** Old templates still showing after updates

**Solution:**
```bash
# Restart Docker container
docker restart kanboard

# Clear browser cache
# Press Ctrl+F5 (Cmd+Shift+R on Mac)
```

### Check Container Logs

```bash
# View recent errors
docker logs kanboard --tail 20

# Follow logs in real-time
docker logs -f kanboard
```

---

## Technical Implementation

### Architecture Overview

```
Plugin.php                      # Main plugin registration
├── Routes
│   ├── /gantt/json/:project_id → GanttController::data()
│   └── /gantt/show/:project_id → ProjectGanttController::show()
├── Controllers
│   ├── GanttController         # JSON API endpoint
│   └── ProjectGanttController  # Gantt chart page
├── Formatters
│   └── GanttDataFormatter      # Data transformation
└── Templates
    ├── project/sidebar.php     # Sidebar navigation link
    └── project_gantt/show.php  # Full Gantt chart interface
```

### Key Components

#### 1. GanttController (JSON API)
```php
// Endpoint: /gantt/json/:project_id
public function data() {
    // Get active tasks for project
    // Transform to DHTMLX format
    // Return JSON response
}
```

#### 2. GanttDataFormatter (Data Transformation)
```php
public function formatTasks($tasks) {
    // Convert Kanboard tasks to DHTMLX format
    // Handle date conversions
    // Calculate progress
}

public function formatLinks($links) {
    // Convert task dependencies to DHTMLX links
    // Filter for "blocks" relationships
    // Map to Finish-to-Start type
}
```

#### 3. ProjectGanttController (Page Display)
```php
public function show() {
    // Load project data
    // Render Gantt chart template
}
```

### Data Flow

```
Kanboard Tasks (database)
    ↓
TaskFinderModel::getAll()
    ↓
GanttDataFormatter::formatTasks()
    ↓
JSON Response (DHTMLX format)
    ↓
DHTMLX Gantt Chart (frontend)
```

### Why Custom Endpoint?

Instead of using Kanboard's JSON-RPC API, we created a custom endpoint because:

1. **Format Mismatch** - JSON-RPC returns Kanboard's internal format
2. **Date Complexity** - Timestamps need conversion to YYYY-MM-DD strings
3. **Authentication** - RPC requires complex auth handling
4. **Performance** - Direct queries are more efficient
5. **Simplicity** - REST-like endpoint is easier to consume

### Security

- **Authentication:** Uses Kanboard's existing session management
- **Authorization:** Checks project permissions before returning data
- **Input Validation:** Project ID validated through `getProject()` method
- **XSS Protection:** Template values are properly escaped

---

## Usage Guide

### Accessing the Gantt Chart

1. **Navigate to any project** in Kanboard
2. **Look for "Gantt chart"** link in left sidebar (with bar chart icon 📊)
3. **Click the link** to view the timeline

### Creating Task Dependencies

1. **Go to a task** in Kanboard
2. **Click** "Add a new link"
3. **Select** "blocks" relationship
4. **Choose** the target task
5. **Dependencies appear** as arrows in Gantt chart

### Gantt Chart Controls

- **View Modes:** Switch between daily, weekly, monthly, quarterly, yearly
- **Zoom In/Out:** Adjust timeline granularity
- **Fit to Screen:** Auto-zoom to show all tasks
- **Add Task:** Create new tasks directly in Gantt chart
- **Export:** Generate PDF or Excel reports

### Best Practices

1. **Set task dates** - Tasks need start/due dates for meaningful visualization
2. **Use dependencies** - Create "blocks" relationships for dependency arrows
3. **Track progress** - Use time estimation or scoring for accurate progress bars
4. **Regular updates** - Keep task status current for real-time visualization

---

## File Structure

```
DhtmlGantt/
├── Plugin.php                     # Main plugin configuration
├── LICENSE                        # License information
├── README.md                      # Project overview
├── COMPLETE_GUIDE.md             # This file
├── docker-install.sh             # Docker installation script
│
├── Controller/
│   ├── GanttController.php       # JSON API endpoint (/gantt/json/:project_id)
│   ├── ProjectGanttController.php # Gantt page display
│   └── TaskGanttController.php   # Task-specific operations
│
├── Formatter/
│   ├── GanttDataFormatter.php    # Kanboard → DHTMLX transformation
│   ├── ProjectGanttFormatter.php # Project formatting utilities
│   └── TaskGanttFormatter.php    # Task formatting utilities
│
├── Template/
│   ├── project/
│   │   └── sidebar.php           # Project sidebar link
│   ├── project-header/
│   │   └── view-switcher.php     # Project header navigation
│   └── project_gantt/
│       └── show.php               # Full Gantt chart interface
│
├── Assets/
│   ├── dhtmlxgantt.js            # DHTMLX Gantt library (555KB)
│   └── dhtmlxgantt.css           # DHTMLX styling (136KB)
│
├── Locale/                        # Translation files
│   └── en_US/
│
└── Test/
    └── GanttDataFormatterTest.php # Format validation tests
```

---

## Quick Reference

### URLs

| Purpose | URL |
|---------|-----|
| Gantt Chart Page | `/gantt/show/:project_id` |
| JSON Data Endpoint | `/gantt/json/:project_id` |
| Kanboard Admin | `http://localhost:8080` |

### Docker Commands

```bash
# Check plugin status
docker exec kanboard ls -la /var/www/app/plugins/DhtmlGantt/

# View logs
docker logs kanboard --tail 20

# Restart container
docker restart kanboard

# Reinstall plugin
./docker-install.sh
```

### Testing Checklist

- [ ] Plugin appears in Settings → Plugins
- [ ] Plugin status is "Enabled"
- [ ] JSON endpoint returns task data: `/gantt/json/1`
- [ ] Gantt page loads: `/gantt/show/1`
- [ ] Sidebar link works in projects
- [ ] Tasks display on timeline
- [ ] Dependencies show as arrows (when created)

---

## Development Notes

### Version History
- **v1.0.0** - Initial release with complex routing
- **v1.1.0** - Simplified routing with direct URL paths

### Known Limitations
- Hierarchical tasks not supported (flat structure only)
- Progress calculation is estimated for tasks without time tracking
- Only "blocks" and "is blocked by" relationships are shown as dependencies

### Future Enhancements
- Custom task colors based on priority/category
- Resource assignment visualization  
- Hierarchical task support (subtasks)
- Critical path highlighting
- Baseline comparison features

---

## Support & Resources

### DHTMLX Gantt Resources
- **Official Docs:** https://docs.dhtmlx.com/gantt/
- **CDN:** https://cdn.dhtmlx.com/gantt/edge/
- **GitHub:** https://github.com/DHTMLX/gantt
- **License:** GPL 2.0 (free) or Commercial

### Kanboard Resources
- **Official Docs:** https://docs.kanboard.org/
- **Plugin API:** https://docs.kanboard.org/en/latest/plugin-api.html
- **Docker Image:** https://hub.docker.com/r/kanboard/kanboard

### Plugin Repository
- **GitHub:** https://github.com/Drackyay/Kanboard_dhtmlGantt_Plugin

---

## Credits

**Developed by:** USC Team B (Fall 2025 CSCI 401)  
**Course:** Software Engineering Project  
**Purpose:** Enhance Kanboard with Trello-like Gantt visualization  
**License:** GPL 2.0 (matching DHTMLX Gantt GPL version)

---

## Appendix: Common Issues & Solutions

### Problem: Plugin Not Showing in Admin Panel

**Check:**
```bash
docker exec kanboard test -f /var/www/app/plugins/DhtmlGantt/Plugin.php && echo "✅ Found" || echo "❌ Missing"
```

**Fix:**
- Reinstall using `./docker-install.sh`
- Check file permissions
- Verify container name is correct

### Problem: JSON Endpoint Returns 403 Forbidden

**Cause:** User doesn't have access to the project

**Solution:**
- Login as admin or project member
- Verify project ID is correct
- Check project permissions in Kanboard

### Problem: Gantt Chart Shows Empty Timeline

**Causes:**
- No tasks in project
- All tasks are closed/archived  
- Tasks have no dates

**Solution:**
- Add tasks in Kanboard
- Set start/due dates on tasks
- Ensure tasks are "active" status

### Problem: Dependencies Not Showing

**Causes:**
- No task links created in Kanboard
- Using wrong link types (not "blocks")
- Linked tasks in different projects

**Solution:**
- Create task links: Task → "Add a new link" → "blocks"
- Use only "blocks" or "is blocked by" relationships
- Ensure both tasks are in same project

---

## Example Use Cases

### Sprint Planning
1. Create tasks for sprint backlog
2. Set realistic start/end dates
3. Add dependencies between related tasks
4. Visualize sprint timeline in Gantt chart

### Project Milestones
1. Create milestone tasks with specific due dates
2. Link deliverables to milestones
3. Track progress visually
4. Share timeline with stakeholders

### Resource Management
1. Assign tasks with time estimates
2. Track actual time spent
3. Progress bars show work completion
4. Identify bottlenecks and delays

---

**End of Complete Guide**

For additional support, refer to the plugin's GitHub repository or Kanboard/DHTMLX documentation.

