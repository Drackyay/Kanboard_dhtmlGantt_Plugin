/*
 * DHtmlX Gantt Initialization Script for Kanboard
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing DHtmlX Gantt...');
    
    // Initialize DHtmlX Gantt
    var initialized = initDhtmlxGantt();
    
    if (!initialized) {
        console.error('Failed to initialize DHtmlX Gantt');
        return;
    }
    
    // Load task data - this will be set by the template
    if (typeof window.taskData !== 'undefined') {
        console.log('Task data:', window.taskData);
        console.log('Task count:', window.taskData && window.taskData.data ? window.taskData.data.length : 'No data structure');
        loadGanttData(window.taskData);
    } else {
        console.warn('No task data found on window.taskData');
        // Load empty data to show the interface
        loadGanttData({data: [], links: []});
    }
    
    // Setup event handlers
    setupGanttEventHandlers();
});

function initDhtmlxGantt() {
    // Check if DHtmlX Gantt library is loaded
    if (typeof gantt === 'undefined') {
        console.error('DHtmlX Gantt library not loaded!');
        return false;
    }
    
    // Check if the container element exists
    var container = document.getElementById('dhtmlx-gantt-chart');
    if (!container) {
        console.error('Gantt container element not found! Looking for #dhtmlx-gantt-chart');
        return false;
    }
    
    console.log('Initializing DHtmlX Gantt...', container);
    
    // Configure DHtmlX Gantt
    gantt.config.date_format = "%Y-%m-%d %H:%i";
    gantt.config.xml_date = "%Y-%m-%d %H:%i";
    gantt.config.scale_unit = "day";
    gantt.config.date_scale = "%d %M";
    gantt.config.subscales = [
        {unit: "hour", step: 1, date: "%H"}
    ];
    
    // Ensure grid is visible
    gantt.config.grid_width = 400;
    gantt.config.show_grid = true;
    
    // Enable plugins
    gantt.plugins({
        tooltip: true,
        keyboard_navigation: true,
        undo: true
    });
    
    // Configure columns
    gantt.config.columns = [
        {name: "text", label: "Task Name", tree: true, width: 200, resize: true},
        {name: "start_date", label: "Start Date", align: "center", width: 100, resize: true},
        {name: "duration", label: "Duration", align: "center", width: 60, resize: true},
        {name: "progress", label: "Progress", align: "center", width: 80, resize: true},
        {name: "priority", label: "Priority", align: "center", width: 80, resize: true},
        {name: "add", label: "", width: 44}
    ];
    
    // Custom task styling
    gantt.templates.task_class = function(start, end, task) {
        var className = "";
        if (task.priority) {
            className += "dhtmlx-priority-" + task.priority + " ";
        }
        if (task.readonly) {
            className += "dhtmlx-readonly ";
        }
        return className;
    };
    
    // Progress template
    gantt.templates.progress_text = function(start, end, task) {
        return "<span>" + Math.round(task.progress * 100) + "% </span>";
    };
    
    // Tooltip template
    gantt.templates.tooltip_text = function(start, end, task) {
        return "<b>Task:</b> " + task.text + "<br/>" +
               "<b>Start:</b> " + gantt.templates.tooltip_date_format(start) + "<br/>" +
               "<b>End:</b> " + gantt.templates.tooltip_date_format(end) + "<br/>" +
               "<b>Progress:</b> " + Math.round(task.progress * 100) + "%<br/>" +
               "<b>Priority:</b> " + (task.priority || 'normal');
    };
    
    // Initialize Gantt
    try {
        gantt.init("dhtmlx-gantt-chart");
        console.log('DHtmlX Gantt initialized successfully');
        return true;
    } catch (error) {
        console.error('Error initializing DHtmlX Gantt:', error);
        return false;
    }
}

function loadGanttData(data) {
    console.log('Loading Gantt data...', data);
    
    if (data && data.data) {
        console.log('Using data.data format, tasks:', data.data.length);
        gantt.parse(data);
    } else if (Array.isArray(data)) {
        console.log('Using array format, tasks:', data.length);
        gantt.parse({data: data, links: []});
    } else {
        console.log('No valid data, creating empty gantt');
        gantt.parse({data: [], links: []});
    }
    
    updateStatistics();
}

function setupGanttEventHandlers() {
    // Data processor for CRUD operations - URLs will be set by template
    if (typeof window.ganttUrls !== 'undefined') {
        var dp = new gantt.dataProcessor({
            task: {
                update: window.ganttUrls.update,
                create: window.ganttUrls.create,
                delete: window.ganttUrls.remove
            },
            link: {
                create: window.ganttUrls.createLink,
                delete: window.ganttUrls.removeLink
            }
        });
        dp.init(gantt);
    }
    
    // Toolbar event handlers
    var addTaskBtn = document.getElementById('dhtmlx-add-task');
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', function() {
            gantt.createTask();
        });
    }
    
    var zoomInBtn = document.getElementById('dhtmlx-zoom-in');
    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', function() {
            gantt.ext.zoom.zoomIn();
        });
    }
    
    var zoomOutBtn = document.getElementById('dhtmlx-zoom-out');
    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', function() {
            gantt.ext.zoom.zoomOut();
        });
    }
    
    var fitBtn = document.getElementById('dhtmlx-fit');
    if (fitBtn) {
        fitBtn.addEventListener('click', function() {
            gantt.ext.zoom.setLevel("month");
        });
    }
    
    // View mode buttons
    document.querySelectorAll('.btn-dhtmlx-view').forEach(function(btn) {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            document.querySelectorAll('.btn-dhtmlx-view').forEach(function(b) {
                b.classList.remove('active');
            });
            // Add active class to clicked button
            this.classList.add('active');
            
            // Change view mode
            const view = this.getAttribute('data-view');
            changeViewMode(view);
        });
    });
    
    // Update statistics when tasks change
    gantt.attachEvent("onAfterTaskUpdate", updateStatistics);
    gantt.attachEvent("onAfterTaskAdd", updateStatistics);
    gantt.attachEvent("onAfterTaskDelete", updateStatistics);
}

function changeViewMode(mode) {
    switch(mode) {
        case 'Quarter Day':
            gantt.config.scale_unit = "hour";
            gantt.config.date_scale = "%H";
            gantt.config.subscales = [{unit: "minute", step: 15, date: "%i"}];
            break;
        case 'Half Day':
            gantt.config.scale_unit = "hour";
            gantt.config.date_scale = "%H";
            gantt.config.subscales = [{unit: "minute", step: 30, date: "%i"}];
            break;
        case 'Day':
            gantt.config.scale_unit = "day";
            gantt.config.date_scale = "%d %M";
            gantt.config.subscales = [{unit: "hour", step: 1, date: "%H"}];
            break;
        case 'Week':
            gantt.config.scale_unit = "week";
            gantt.config.date_scale = "Week #%W";
            gantt.config.subscales = [{unit: "day", step: 1, date: "%d %M"}];
            break;
        case 'Month':
            gantt.config.scale_unit = "month";
            gantt.config.date_scale = "%F %Y";
            gantt.config.subscales = [{unit: "day", step: 1, date: "%d"}];
            break;
    }
    gantt.render();
}

function updateStatistics() {
    var tasks = gantt.getTaskByTime();
    var completed = 0;
    var inProgress = 0;
    
    tasks.forEach(function(task) {
        if (task.progress >= 1) {
            completed++;
        } else if (task.progress > 0) {
            inProgress++;
        }
    });
    
    var completedElement = document.getElementById('dhtmlx-completed-count');
    var progressElement = document.getElementById('dhtmlx-progress-count');
    
    if (completedElement) completedElement.textContent = completed;
    if (progressElement) progressElement.textContent = inProgress;
}
