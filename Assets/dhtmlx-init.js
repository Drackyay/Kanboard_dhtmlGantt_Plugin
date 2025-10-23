// /*
//  * DHtmlX Gantt Initialization Script for Kanboard
//  */

// document.addEventListener('DOMContentLoaded', function() {
//     console.log('DOM loaded, initializing DHtmlX Gantt...');
    
//     // Initialize DHtmlX Gantt
//     var initialized = initDhtmlxGantt();
    
//     if (!initialized) {
//         console.error('Failed to initialize DHtmlX Gantt');
//         return;
//     }
    
//     // Load task data - this will be set by the template
//     if (typeof window.taskData !== 'undefined') {
//         console.log('Task data:', window.taskData);
//         console.log('Task count:', window.taskData && window.taskData.data ? window.taskData.data.length : 'No data structure');
//         loadGanttData(window.taskData);
//     } else {
//         console.warn('No task data found on window.taskData');
//         // Load empty data to show the interface
//         loadGanttData({data: [], links: []});
//     }
    
//     // Setup event handlers
//     setupGanttEventHandlers();
// });

// function initDhtmlxGantt() {
//     // Check if DHtmlX Gantt library is loaded
//     if (typeof gantt === 'undefined') {
//         console.error('DHtmlX Gantt library not loaded!');
//         return false;
//     }
    
//     // Check if the container element exists
//     var container = document.getElementById('dhtmlx-gantt-chart');
//     if (!container) {
//         console.error('Gantt container element not found! Looking for #dhtmlx-gantt-chart');
//         return false;
//     }
    
//     console.log('Initializing DHtmlX Gantt...', container);
    
//     // Configure DHtmlX Gantt
//     gantt.config.date_format = "%Y-%m-%d %H:%i";
//     gantt.config.xml_date = "%Y-%m-%d %H:%i";
//     gantt.config.scale_unit = "day";
//     gantt.config.date_scale = "%d %M";
//     gantt.config.subscales = [
//         {unit: "hour", step: 1, date: "%H"}
//     ];
    
//     // Ensure grid is visible
//     gantt.config.grid_width = 400;
//     gantt.config.show_grid = true;
    
//     // Enable plugins
//     gantt.plugins({
//         tooltip: true,
//         keyboard_navigation: true,
//         undo: true
//     });
    
//     // Configure columns
//     gantt.config.columns = [
//         {name: "text", label: "Task Name", tree: true, width: 200, resize: true},
//         {name: "start_date", label: "Start Date", align: "center", width: 100, resize: true},
//         {name: "duration", label: "Duration", align: "center", width: 60, resize: true},
//         {name: "progress", label: "Progress", align: "center", width: 80, resize: true},
//         {name: "priority", label: "Priority", align: "center", width: 80, resize: true},
//         {name: "add", label: "", width: 44}
//     ];
    
//     // Custom task styling
//     gantt.templates.task_class = function(start, end, task) {
//         var className = "";
//         if (task.priority) {
//             className += "dhtmlx-priority-" + task.priority + " ";
//         }
//         if (task.readonly) {
//             className += "dhtmlx-readonly ";
//         }
//         return className;
//     };
    
//     // Progress template
//     gantt.templates.progress_text = function(start, end, task) {
//         return "<span>" + Math.round(task.progress * 100) + "% </span>";
//     };
    
//     // Tooltip template
//     gantt.templates.tooltip_text = function(start, end, task) {
//         return "<b>Task:</b> " + task.text + "<br/>" +
//                "<b>Start:</b> " + gantt.templates.tooltip_date_format(start) + "<br/>" +
//                "<b>End:</b> " + gantt.templates.tooltip_date_format(end) + "<br/>" +
//                "<b>Progress:</b> " + Math.round(task.progress * 100) + "%<br/>" +
//                "<b>Priority:</b> " + (task.priority || 'normal');
//     };
    
//     // Initialize Gantt
//     try {
//         gantt.init("dhtmlx-gantt-chart");
//         console.log('DHtmlX Gantt initialized successfully');
//         return true;
//     } catch (error) {
//         console.error('Error initializing DHtmlX Gantt:', error);
//         return false;
//     }
// }

// function loadGanttData(data) {
//     console.log('Loading Gantt data...', data);
    
//     if (data && data.data) {
//         console.log('Using data.data format, tasks:', data.data.length);
//         gantt.parse(data);
//     } else if (Array.isArray(data)) {
//         console.log('Using array format, tasks:', data.length);
//         gantt.parse({data: data, links: []});
//     } else {
//         console.log('No valid data, creating empty gantt');
//         gantt.parse({data: [], links: []});
//     }
    
//     updateStatistics();
// }

// function setupGanttEventHandlers() {
//     // Data processor for CRUD operations - URLs will be set by template
//     if (typeof window.ganttUrls !== 'undefined') {
//         var dp = new gantt.dataProcessor({
//             task: {
//                 update: window.ganttUrls.update,
//                 create: window.ganttUrls.create,
//                 delete: window.ganttUrls.remove
//             },
//             link: {
//                 create: window.ganttUrls.createLink,
//                 delete: window.ganttUrls.removeLink
//             }
//         });
//         dp.init(gantt);
//     }
    
//     // Toolbar event handlers
//     var addTaskBtn = document.getElementById('dhtmlx-add-task');
//     if (addTaskBtn) {
//         addTaskBtn.addEventListener('click', function() {
//             gantt.createTask();
//         });
//     }
    
//     var zoomInBtn = document.getElementById('dhtmlx-zoom-in');
//     if (zoomInBtn) {
//         zoomInBtn.addEventListener('click', function() {
//             gantt.ext.zoom.zoomIn();
//         });
//     }
    
//     var zoomOutBtn = document.getElementById('dhtmlx-zoom-out');
//     if (zoomOutBtn) {
//         zoomOutBtn.addEventListener('click', function() {
//             gantt.ext.zoom.zoomOut();
//         });
//     }
    
//     var fitBtn = document.getElementById('dhtmlx-fit');
//     if (fitBtn) {
//         fitBtn.addEventListener('click', function() {
//             gantt.ext.zoom.setLevel("month");
//         });
//     }
    
//     // View mode buttons
//     document.querySelectorAll('.btn-dhtmlx-view').forEach(function(btn) {
//         btn.addEventListener('click', function() {
//             // Remove active class from all buttons
//             document.querySelectorAll('.btn-dhtmlx-view').forEach(function(b) {
//                 b.classList.remove('active');
//             });
//             // Add active class to clicked button
//             this.classList.add('active');
            
//             // Change view mode
//             const view = this.getAttribute('data-view');
//             changeViewMode(view);
//         });
//     });
    
//     // Update statistics when tasks change
//     gantt.attachEvent("onAfterTaskUpdate", updateStatistics);
//     gantt.attachEvent("onAfterTaskAdd", updateStatistics);
//     gantt.attachEvent("onAfterTaskDelete", updateStatistics);
// }

// function changeViewMode(mode) {
//     switch(mode) {
//         case 'Quarter Day':
//             gantt.config.scale_unit = "hour";
//             gantt.config.date_scale = "%H";
//             gantt.config.subscales = [{unit: "minute", step: 15, date: "%i"}];
//             break;
//         case 'Half Day':
//             gantt.config.scale_unit = "hour";
//             gantt.config.date_scale = "%H";
//             gantt.config.subscales = [{unit: "minute", step: 30, date: "%i"}];
//             break;
//         case 'Day':
//             gantt.config.scale_unit = "day";
//             gantt.config.date_scale = "%d %M";
//             gantt.config.subscales = [{unit: "hour", step: 1, date: "%H"}];
//             break;
//         case 'Week':
//             gantt.config.scale_unit = "week";
//             gantt.config.date_scale = "Week #%W";
//             gantt.config.subscales = [{unit: "day", step: 1, date: "%d %M"}];
//             break;
//         case 'Month':
//             gantt.config.scale_unit = "month";
//             gantt.config.date_scale = "%F %Y";
//             gantt.config.subscales = [{unit: "day", step: 1, date: "%d"}];
//             break;
//     }
//     gantt.render();
// }

// function updateStatistics() {
//     var tasks = gantt.getTaskByTime();
//     var completed = 0;
//     var inProgress = 0;
    
//     tasks.forEach(function(task) {
//         if (task.progress >= 1) {
//             completed++;
//         } else if (task.progress > 0) {
//             inProgress++;
//         }
//     });
    
//     var completedElement = document.getElementById('dhtmlx-completed-count');
//     var progressElement = document.getElementById('dhtmlx-progress-count');
    
//     if (completedElement) completedElement.textContent = completed;
//     if (progressElement) progressElement.textContent = inProgress;
// }




/*
 * DHtmlX Gantt Initialization Script for Kanboard
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing DHtmlX Gantt...');
    
    // Get the container element
    var container = document.getElementById('dhtmlx-gantt-chart');
    if (!container) {
        console.error('Gantt container element not found!');
        return;
    }
    
    // Initialize DHtmlX Gantt
    var initialized = initDhtmlxGantt();
    
    if (!initialized) {
        console.error('Failed to initialize DHtmlX Gantt');
        return;
    }
    
    // Load task data from data attribute
    var taskDataString = container.getAttribute('data-tasks');
    // var taskData = null;
    
    // try {
    //     if (taskDataString) {
    //         taskData = JSON.parse(taskDataString);
    //         console.log('Task data loaded from attribute:', taskData);
    //         console.log('Task count:', taskData && taskData.data ? taskData.data.length : 'No data structure');
    //     }
    // } catch (e) {
    //     console.error('Failed to parse task data:', e);
    // }
    
    // if (taskData && taskData.data && taskData.data.length > 0) {
    //     loadGanttData(taskData);
    // } else {
    //     console.warn('No task data found, loading empty chart');
    //     loadGanttData({data: [], links: []});
    // }

    // Load task data from window.taskData (set by inline script in template)


    var taskDataString = container.getAttribute('data-tasks');
    var taskData = null;
    
    try {
        if (taskDataString) {
            taskData = JSON.parse(taskDataString);
            console.log('Task data loaded from attribute:', taskData);
            console.log('Task count:', taskData && taskData.data ? taskData.data.length : 'No data structure');
        } else {
            console.warn('No data-tasks attribute found');
        }
    } catch (e) {
        console.error('Failed to parse task data:', e);
    }
    
    if (taskData && taskData.data && taskData.data.length > 0) {
        loadGanttData(taskData);
    } else {
        console.warn('No task data found, loading empty chart');
        loadGanttData({data: [], links: []});
    }

    
    // Setup URLs from data attributes
    window.ganttUrls = {
        update: container.getAttribute('data-update-url'),
        create: container.getAttribute('data-create-url'),
        remove: container.getAttribute('data-remove-url'),
        createLink: container.getAttribute('data-create-link-url'),
        removeLink: container.getAttribute('data-remove-link-url')
    };
    
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
    
    // Configure DHtmlX Gantt with NEW scale configuration format
    gantt.config.date_format = "%Y-%m-%d %H:%i";
    gantt.config.xml_date = "%Y-%m-%d %H:%i";
    
    // NEW scale configuration format (fixes deprecation warnings) - Default to Week view
    gantt.config.scales = [
        {unit: "week", step: 1, format: "Week #%W"},
        {unit: "day", step: 1, format: "%d %M"}
    ];
    
    // Ensure grid is visible
    gantt.config.grid_width = 400;
    gantt.config.show_grid = true;
    
    // Enable plugins
    gantt.plugins({
        tooltip: true,
        keyboard_navigation: true,
        undo: true,
        grouping: true  // Add this line
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
    
    //new
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
    //new


    
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


//new
// Simple zoom configuration
var currentZoomLevel = 1; // Start at day view
var zoomLevels = [
    { name: "hour", scales: [{unit: "day", format: "%d %M"}, {unit: "hour", format: "%H"}] },
    { name: "day", scales: [{unit: "week", format: "Week #%W"}, {unit: "day", format: "%d %M"}] },
    { name: "week", scales: [{unit: "month", format: "%F"}, {unit: "week", format: "W%W"}] },
    { name: "month", scales: [{unit: "year", format: "%Y"}, {unit: "month", format: "%M"}] }
];

function smartZoom(direction) {
    var newLevel = direction === 'in' ? 
        Math.max(0, currentZoomLevel - 1) : 
        Math.min(zoomLevels.length - 1, currentZoomLevel + 1);
    
    if (newLevel === currentZoomLevel) return;
    
    // Save center date to maintain position
    var scrollState = gantt.getScrollState();
    var centerDate = gantt.dateFromPos(scrollState.x + scrollState.width / 2);
    
    // Apply zoom
    gantt.config.scales = zoomLevels[newLevel].scales;
    gantt.render();
    currentZoomLevel = newLevel;
    
    // Restore center position
    if (centerDate) {
        var newPos = gantt.posFromDate(centerDate);
        gantt.scrollTo(newPos - scrollState.width / 2, scrollState.y);
    }
}

function smartFitToScreen() {
    var tasks = gantt.getTaskByTime();
    if (tasks.length === 0) return;
    
    // Find actual date range
    var minDate = null, maxDate = null;
    tasks.forEach(function(task) {
        var start = task.start_date;
        var end = task.end_date || gantt.calculateEndDate(start, task.duration);
        if (!minDate || start < minDate) minDate = start;
        if (!maxDate || end > maxDate) maxDate = end;
    });
    
    // Add 10% padding
    var diff = (maxDate - minDate) / 10;
    minDate = new Date(minDate.getTime() - diff);
    maxDate = new Date(maxDate.getTime() + diff);
    
    // Calculate best zoom level
    var container = document.getElementById('dhtmlx-gantt-chart');
    var availableWidth = container.offsetWidth - gantt.config.grid_width;
    var totalDays = (maxDate - minDate) / (1000 * 60 * 60 * 24);
    var pixelsPerDay = availableWidth / totalDays;
    
    // Pick level: >80px/day=hour, >40=day, >15=week, else month
    var level = pixelsPerDay > 80 ? 0 : pixelsPerDay > 40 ? 1 : pixelsPerDay > 15 ? 2 : 3;
    
    // Apply
    gantt.config.scales = zoomLevels[level].scales;
    gantt.config.start_date = minDate;
    gantt.config.end_date = maxDate;
    gantt.render();
    currentZoomLevel = level;
    
    // Scroll to start
    gantt.showDate(minDate);
}
//new



function setupGanttEventHandlers() {
    // Data processor for CRUD operations - URLs will be set by template
    if (typeof window.ganttUrls !== 'undefined' && window.ganttUrls.update) {
        console.log('Setting up data processor with URLs:', window.ganttUrls);
        
        // Use simplified event-based approach instead of data processor
        gantt.attachEvent("onAfterTaskUpdate", function(id, task) {
            console.log('Task updated, sending to server:', id, task);
            
            // Send update to server
            fetch(window.ganttUrls.update, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: id,
                    start_date: task.start_date,
                    end_date: task.end_date,
                    text: task.text
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log('Server response:', data);
                if (data.result !== 'ok') {
                    console.error('Failed to save task:', data.message);
                }
            })
            .catch(error => {
                console.error('Error saving task:', error);
            });
        });
        
        console.log('Event-based data handling initialized successfully');
        
    } else {
        console.warn('No ganttUrls found, data processor not initialized');
    }
    
    // Toolbar event handlers
    var addTaskBtn = document.getElementById('dhtmlx-add-task');
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', function() {
            gantt.createTask();
        });
    }
    
    // var zoomInBtn = document.getElementById('dhtmlx-zoom-in');
    // if (zoomInBtn) {
    //     zoomInBtn.addEventListener('click', function() {
    //         if (gantt.ext && gantt.ext.zoom) {
    //             gantt.ext.zoom.zoomIn();
    //         }
    //     });
    // }
    
    // var zoomOutBtn = document.getElementById('dhtmlx-zoom-out');
    // if (zoomOutBtn) {
    //     zoomOutBtn.addEventListener('click', function() {
    //         if (gantt.ext && gantt.ext.zoom) {
    //             gantt.ext.zoom.zoomOut();
    //         }
    //     });
    // }
    
    // var fitBtn = document.getElementById('dhtmlx-fit');
    // if (fitBtn) {
    //     fitBtn.addEventListener('click', function() {
    //         if (gantt.ext && gantt.ext.zoom) {
    //             gantt.ext.zoom.setLevel("month");
    //         }
    //     });
    // }


    // Enhanced zoom handlers
var zoomInBtn = document.getElementById('dhtmlx-zoom-in');
if (zoomInBtn) {
    zoomInBtn.addEventListener('click', function() {
        smartZoom('in');
    });
}

var zoomOutBtn = document.getElementById('dhtmlx-zoom-out');
if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', function() {
        smartZoom('out');
    });
}

var fitBtn = document.getElementById('dhtmlx-fit');
if (fitBtn) {
    fitBtn.addEventListener('click', function() {
        smartFitToScreen();
    });
}

var groupByAssigneeBtn = document.getElementById('dhtmlx-group-assignee');
if (groupByAssigneeBtn) {
    var isGrouped = false;
    groupByAssigneeBtn.addEventListener('click', function() {
        if (!isGrouped) {
            groupByAssignee();
            this.classList.add('active');
            isGrouped = true;
        } else {
            clearGrouping();
            this.classList.remove('active');
            isGrouped = false;
        }
    });
}//NEWNEW

    
    // View mode buttons - add delay to ensure DOM is ready
    setTimeout(function() {
        const viewButtons = document.querySelectorAll('.btn-dhtmlx-view');
        console.log('Found view buttons:', viewButtons.length);
        
        viewButtons.forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const view = this.getAttribute('data-view');
                console.log('View mode button clicked:', view);
                
                // Remove active class from all buttons
                document.querySelectorAll('.btn-dhtmlx-view').forEach(function(b) {
                    b.classList.remove('active');
                });
                // Add active class to clicked button
                this.classList.add('active');
                
                // Change view mode
                changeViewMode(view);
            });
        });
    }, 100);
    
    // Update statistics when tasks change
    gantt.attachEvent("onAfterTaskUpdate", function(id, task) {
        console.log('Task statistics update for:', id, task);
        updateStatistics();
    });
    gantt.attachEvent("onAfterTaskAdd", updateStatistics);
    gantt.attachEvent("onAfterTaskDelete", updateStatistics);


}

function changeViewMode(mode) {
    console.log('Changing view mode to:', mode);
    // Use NEW scale configuration format
    switch(mode) {
        case 'Quarter Day':
            gantt.config.scales = [
                {unit: "hour", step: 1, format: "%H"},
                {unit: "minute", step: 15, format: "%i"}
            ];
            break;
        case 'Half Day':
            gantt.config.scales = [
                {unit: "hour", step: 1, format: "%H"},
                {unit: "minute", step: 30, format: "%i"}
            ];
            break;
        case 'Day':
            gantt.config.scales = [
                {unit: "day", step: 1, format: "%d %M"},
                {unit: "hour", step: 1, format: "%H"}
            ];
            break;
        case 'Week':
            gantt.config.scales = [
                {unit: "week", step: 1, format: "Week #%W"},
                {unit: "day", step: 1, format: "%d %M"}
            ];
            break;
        case 'Month':
            gantt.config.scales = [
                {unit: "month", step: 1, format: "%F %Y"},
                {unit: "day", step: 1, format: "%d"}
            ];
            break;
    }
    gantt.render();
    console.log('View mode changed to:', mode, 'Gantt re-rendered');
}



//new
var originalTasks = null; // Store original task data

function groupByAssignee() {
    console.log('Grouping by assignee...');
    
    // Store original tasks if not already stored
    if (!originalTasks) {
        originalTasks = gantt.serialize();
    }
    
    // Get all tasks
    var tasks = gantt.getTaskByTime();
    var groups = {};
    var groupedData = [];
    var groupIdCounter = 10000; // Start group IDs at a high number to avoid conflicts
    
    // Group tasks by assignee
    tasks.forEach(function(task) {
        var assignee = task.assignee || 'Unassigned';
        if (!groups[assignee]) {
            groups[assignee] = {
                id: groupIdCounter++,
                text: assignee,
                start_date: task.start_date,
                duration: 0,
                progress: 0,
                type: 'project', // Make it a project/group
                open: true,
                assignee: assignee,
                tasks: []
            };
        }
        groups[assignee].tasks.push(task);
    });
    
    // Build grouped structure
    for (var assignee in groups) {
        var group = groups[assignee];
        var minDate = null;
        var maxDate = null;
        var totalProgress = 0;
        
        // Calculate group properties
        group.tasks.forEach(function(task) {
            if (!minDate || task.start_date < minDate) {
                minDate = task.start_date;
            }
            var taskEnd = task.end_date || gantt.calculateEndDate(task.start_date, task.duration);
            if (!maxDate || taskEnd > maxDate) {
                maxDate = taskEnd;
            }
            totalProgress += task.progress;
        });
        
        group.start_date = minDate;
        group.end_date = maxDate;
        group.duration = gantt.calculateDuration(minDate, maxDate);
        group.progress = totalProgress / group.tasks.length;
        
        // Add group
        groupedData.push({
            id: group.id,
            text: group.text + ' (' + group.tasks.length + ' tasks)',
            start_date: gantt.date.date_to_str(gantt.config.date_format)(group.start_date),
            duration: group.duration,
            progress: group.progress,
            type: 'project',
            open: true
        });
        
        // Add tasks under group
        group.tasks.forEach(function(task) {
            groupedData.push({
                id: task.id,
                text: task.text,
                start_date: gantt.date.date_to_str(gantt.config.date_format)(task.start_date),
                end_date: gantt.date.date_to_str(gantt.config.date_format)(task.end_date || gantt.calculateEndDate(task.start_date, task.duration)),
                duration: task.duration,
                progress: task.progress,
                priority: task.priority,
                color: task.color,
                parent: group.id, // Set parent to group
                assignee: task.assignee
            });
        });
    }
    
    // Clear and reload with grouped data
    gantt.clearAll();
    gantt.parse({data: groupedData, links: []});
    
    console.log('Grouped by assignee successfully');
}

function clearGrouping() {
    console.log('Clearing grouping...');
    
    if (originalTasks) {
        gantt.clearAll();
        gantt.parse(originalTasks);
        originalTasks = null;
    }
    
    console.log('Grouping cleared');
}
//new

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