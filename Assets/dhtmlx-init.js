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
        
        // Milestone takes priority over other styling
        if (task.is_milestone) {
            className += "milestone-block ";
        } else if (task.priority) {
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
    
    // Task text template - show task name with assignee for regular tasks, "M" for milestones
    gantt.templates.task_text = function(start, end, task) {
        if (task.is_milestone) {
            return "M";
        }
        
        var text = task.text;
        // Add assignee name in brackets if available
        if (task.assignee && task.assignee.trim() !== '') {
            text += " [" + task.assignee + "]";
        }
        return text;
    };
    
    // Right-side text template - show assignee with icon
    gantt.templates.rightside_text = function(start, end, task) {
        if (task.assignee && task.assignee.trim() !== '') {
            return "👤 " + task.assignee;
        }
        return "";
    };
    
    // Tooltip template
    gantt.templates.tooltip_text = function(start, end, task) {
        var tooltip = "<b>" + (task.is_milestone ? "Milestone" : "Task") + ":</b> " + task.text + "<br/>" +
               "<b>Start:</b> " + gantt.templates.tooltip_date_format(start) + "<br/>" +
               "<b>End:</b> " + gantt.templates.tooltip_date_format(end) + "<br/>" +
               "<b>Progress:</b> " + Math.round(task.progress * 100) + "%<br/>";
        
        if (!task.is_milestone) {
            tooltip += "<b>Priority:</b> " + (task.priority || 'normal');
        }
        
        // Add assignee info to tooltip
        if (task.assignee && task.assignee.trim() !== '') {
            tooltip += "<br/><b>Assignee:</b> " + task.assignee;
        }
        
        return tooltip;
    };
    //new



    // new code for lightbox + link to kb
    // Configure lightbox sections to add "View in Kanboard" button
gantt.config.lightbox.sections = [
    {name: "type", height: 22, map_to: "is_milestone", type: "select", options: [
        {key: false, label: "Task"},
        {key: true, label: "Milestone"}
    ]},
    {name: "description", height: 38, map_to: "text", type: "textarea", focus: true},
    {name: "priority", height: 22, map_to: "priority", type: "select", options: [
        {key: "low", label: "Low"},
        {key: "normal", label: "Normal"},
        {key: "medium", label: "Medium"},
        {key: "high", label: "High"}
    ]},
    {name: "time", type: "duration", map_to: "auto"},
    {name: "kanboard_link", height: 40, type: "template", map_to: "my_template"}
];

// Custom labels for lightbox sections
gantt.locale.labels.section_type = "Type";
gantt.locale.labels.section_kanboard_link = "Quick Actions";

// Set default values for new tasks
gantt.attachEvent("onBeforeLightbox", function(id) {
    var task = gantt.getTask(id);
    
    // Set default priority to "normal" if not already set
    if (!task.priority) {
        task.priority = "normal";
    }
    
    // Set default is_milestone to false if not already set
    if (task.is_milestone === undefined) {
        task.is_milestone = false;
    }
    
    // Always use type "task" for rendering (rectangular bars)
    task.type = "task";
    
    return true;
});

// Watch for lightbox to appear and handle milestone field hiding
var lightboxObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(function(node) {
            if (node.nodeType === 1 && node.classList && node.classList.contains('gantt_cal_light')) {
                console.log('Lightbox detected!');
                
                setTimeout(function() {
                    setupLightboxFieldToggle();
                }, 100);
            }
        });
    });
});

// Start observing the document for lightbox
lightboxObserver.observe(document.body, {
    childList: true,
    subtree: true
});

function setupLightboxFieldToggle(retryCount) {
    retryCount = retryCount || 0;
    
    // Try multiple selectors
    var lightbox = document.querySelector('.gantt_cal_light');
    
    if (!lightbox && retryCount < 10) {
        setTimeout(function() {
            setupLightboxFieldToggle(retryCount + 1);
        }, 50);
        return;
    }
    
    if (!lightbox) {
        console.log('Lightbox not found after retries');
        return;
    }
    
    console.log('Lightbox found, looking for type select...');
    
    // Debug: log all select elements in the lightbox
    var allSelects = lightbox.querySelectorAll('select');
    console.log('All select elements in lightbox:', allSelects.length);
    allSelects.forEach(function(sel, idx) {
        console.log('Select ' + idx + ':', sel, 'name:', sel.name, 'id:', sel.id);
    });
    
    // Try different selectors - DHTMLX uses generated ids and empty names
    // Use title attribute logged in console: title="type" / title="priority"
    var typeSelect = lightbox.querySelector('select[title="type"]');
    
    console.log('Setting up field toggle (attempt ' + (retryCount + 1) + '), type select:', typeSelect);
    
    if (!typeSelect) {
        if (retryCount < 10) {
            // Retry after 50ms, up to 10 times (500ms total)
            setTimeout(function() {
                setupLightboxFieldToggle(retryCount + 1);
            }, 50);
        } else {
            console.log('Type select not found after 10 retries');
        }
        return;
    }
    
    console.log('Type select found! Setting up event listeners');
    
    // Remove any existing listeners by cloning
    var newTypeSelect = typeSelect.cloneNode(true);
    typeSelect.parentNode.replaceChild(newTypeSelect, typeSelect);
    typeSelect = newTypeSelect;
    
    // Function to toggle fields based on type
    var toggleFields = function() {
        // Select dropdown value can be string "true"/"false" or boolean
        var isMilestone = typeSelect.value === 'true' || typeSelect.value === true || typeSelect.value === 'milestone';
        
        console.log('Toggling fields, isMilestone:', isMilestone, 'value:', typeSelect.value, 'type:', typeof typeSelect.value);
        
        // Scope to the lightbox markup
        var lightbox = document.querySelector('.gantt_cal_light');
        if (!lightbox) return;

        // Hide/show Priority section (select with title="priority")
        var prioritySelect = lightbox.querySelector('select[title="priority"]');
        if (prioritySelect) {
            var prContent = prioritySelect.closest('.gantt_cal_ltext') || prioritySelect.parentElement;
            var prLabel = prContent && prContent.previousElementSibling && prContent.previousElementSibling.classList && prContent.previousElementSibling.classList.contains('gantt_cal_lsection') ? prContent.previousElementSibling : null;
            if (prContent) prContent.style.display = isMilestone ? 'none' : '';
            if (prLabel) prLabel.style.display = isMilestone ? 'none' : '';
            console.log('Priority section hidden:', isMilestone, 'content:', !!prContent, 'label:', !!prLabel);
        } else {
            console.log('Priority select not found');
        }

        // Hide/show only the duration numeric input (keep start date selects visible)
        var durationCandidates = lightbox.querySelectorAll(
            '.gantt_time input[type="number"],\
             .gantt_time input[aria-label="Duration"],\
             .gantt_time input[id*="duration"],\
             .gantt_time .gantt_duration input,\
             .gantt_time .gantt_duration_value'
        );
        console.log('Duration numeric inputs found:', durationCandidates.length);
        durationCandidates.forEach(function(inp){
            if (inp && inp.style) inp.style.display = isMilestone ? 'none' : '';
            var wrap = inp.closest('.gantt_duration, .gantt_duration_line, .gantt_time_duration');
            if (wrap && wrap !== lightbox) wrap.style.display = isMilestone ? 'none' : '';
        });
    };
    
    // Apply on load
    toggleFields();
    
    // Apply on change
    typeSelect.addEventListener('change', function() {
        console.log('Type changed to:', typeSelect.value);
        toggleFields();
    });
}

// Handle milestone save to keep type as task and apply green color
gantt.attachEvent("onLightboxSave", function(id, task, is_new) {
    console.log('Lightbox save, task:', task, 'is_milestone:', task.is_milestone, 'type:', typeof task.is_milestone);
    
    // Always keep type as "task" for rectangular bars
    task.type = "task";
    
    // Convert is_milestone to boolean (select returns string "true"/"false")
    if (task.is_milestone === "true" || task.is_milestone === true) {
        task.is_milestone = true;
        task.color = "#27ae60";
        console.log('Set milestone color to green for task:', id);
    } else {
        task.is_milestone = false;
        // Reset color if changed from milestone to task (let server/priority determine color)
        console.log('Task is not a milestone, keeping original color');
    }
    
    return true;
});

gantt.form_blocks["template"] = {
    render: function(sns) {
        return "<div class='dhtmlx_cal_ltext' style='height:" + sns.height + "px;'></div>";
    },
    set_value: function(node, value, task, section) {
        var projectId = document.getElementById('dhtmlx-gantt-chart').getAttribute('data-project-id');
        var taskId = task.id;
        
        // Build the Kanboard task view URL
        var taskUrl = window.location.origin + window.location.pathname.replace(/\/[^\/]*\/[^\/]*$/, '') + 
                      '?controller=TaskViewController&action=show&task_id=' + taskId + '&project_id=' + projectId;
        
        // Create button element using DOM (CSP-compliant - no inline onclick)
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'gantt_btn_set gantt_view_kanboard_btn';
        button.style.cssText = 'margin: 5px; padding: 8px 16px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;';
        button.innerHTML = '<i class="fa fa-external-link"></i> View Task in Kanboard';
        
        // Attach event listener programmatically (CSP-compliant)
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            window.open(taskUrl, '_blank');
            return false;
        });
        
        // Clear node and append button
        node.innerHTML = '';
        node.appendChild(button);
    },
    get_value: function(node, task, section) {
        return task[section.map_to];
    },
    focus: function(node) {
        // No focus needed for button
    }
};
    // new code for lightbox + link to kb


    
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
    gantt.eachTask(function (t) {
        if (t.parent === undefined || t.parent === null) {
            t.parent = 0;       // treat as top-level
        }
    });
    
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
    // Bind once guard
    if (window.__ganttHandlersBound) {
        console.log('[Gantt] handlers already bound — skipping');
        return;
    }
    window.__ganttHandlersBound = true;

    // de-duped toast helper (global-ish)
    if (!window.singleToast) {
        let __lastToast = { text: "", at: 0 };
        window.singleToast = function(text) {
            const now = Date.now();
            if (text === __lastToast.text && now - __lastToast.at < 1000) return;
            __lastToast = { text, at: now };
            gantt.message({ type: "warning", text, expire: 1500 });
        };
    }
    // Data processor for CRUD operations - URLs will be set by template
    if (typeof window.ganttUrls !== 'undefined' && window.ganttUrls.update) {
        console.log('Setting up data processor with URLs:', window.ganttUrls);
        
        // Use simplified event-based approach instead of data processor
        // ---- same-level rule helpers ----
    function _parentOf(task){
        return (task && task.parent != null && task.parent !== undefined) ? task.parent : 0;
    }
    function _sameLevelAllowed(a, b){
        const pa = _parentOf(a);
        const pb = _parentOf(b);
        // allowed: both top-level OR both children of the same parent
        return (pa === 0 && pb === 0) || (pa !== 0 && pa === pb);
    }
    
    // dhtmlx built-in validator (runs before adding the link)
    gantt.attachEvent("onLinkValidation", function(link){
        const s = gantt.getTask(link.source);
        const t = gantt.getTask(link.target);
        const ok = _sameLevelAllowed(s, t);
        if (!ok) singleToast("Rule: only siblings or top-level tasks can be linked.");
        return ok;
      });
    
        // Handle task updates (only for existing tasks)
        gantt.attachEvent("onAfterTaskUpdate", function(id, task) {
            console.log('Task updated, sending to server:', id, task);
            
            // Apply green color if milestone
            if (task.is_milestone) {
                task.color = "#27ae60";
                gantt.refreshTask(id); // Force re-render with new color
            }
            
            // Send update to server including all fields
            fetch(window.ganttUrls.update, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: id,
                    text: task.text,
                    start_date: task.start_date,
                    end_date: task.end_date,
                    priority: task.priority,
                    is_milestone: task.is_milestone ? 1 : 0
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
        
        // Handle task deletion
        gantt.attachEvent("onBeforeTaskDelete", function(id, task) {
            console.log('Task deletion requested, sending to server:', id, task);
            
            // Send delete request to server
            fetch(window.ganttUrls.remove, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: id
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log('Task deletion response:', data);
                if (data.result !== 'ok') {
                    console.error('Failed to delete task:', data.message);
                }
            })
            .catch(error => {
                console.error('Error deleting task:', error);
            });
            
            // Return true to allow the deletion in the UI
            return true;
        });
        
        // Handle dependency creation when user draws arrows in Gantt
        gantt.attachEvent("onAfterLinkAdd", function(id, link) {
            console.log('Link created, sending to server:', id, link);
            console.log('Using URL:', window.ganttUrls.createLink);
            
            // Send dependency to server using fetch API
            fetch(window.ganttUrls.createLink, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    source: link.source,
                    target: link.target,
                    type: link.type
                })
            })
            .then(response => {
                console.log('Response status:', response.status);
                console.log('Response headers:', response.headers);
                return response.text(); // Get as text first to see what we're getting
            })
            .then(text => {
                console.log('Raw response:', text);
                try {
                    const data = JSON.parse(text);
                    console.log('Dependency creation response:', data);
                    if (data.result !== 'ok') {
                        console.error('Failed to create dependency:', data.message);
                        gantt.deleteLink(id);
                        return;
                    }
                    // ✅ SUCCESS: Refresh the chart to reflect the changes
                    console.log('Dependency created successfully, refreshing chart...');
                    gantt.render();
                } catch (parseError) {
                    console.error('JSON parse error:', parseError);
                    console.error('Response was not valid JSON:', text);
                    // Remove the link from the Gantt if creation failed
                    gantt.deleteLink(id);
                }
            })
            .catch(error => {
                console.error('Error creating dependency:', error);
                // Remove the link from the Gantt if creation failed
                gantt.deleteLink(id);
            });
        });

        // Handle dependency removal when user deletes arrows in Gantt
        gantt.attachEvent("onAfterLinkDelete", function(id, link) {
            console.log('Link deleted, sending to server:', id, link);
            
            // Send removal request to server using fetch API
            fetch(window.ganttUrls.removeLink, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    id: id,
                    source: link.source,
                    target: link.target
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log('Dependency removal response:', data);
                if (data.result === 'ok') {
                    // ✅ SUCCESS: Refresh the chart to reflect the changes
                    console.log('Dependency removed successfully, refreshing chart...');
                    gantt.render();
                } else {
                    console.error('Failed to remove dependency:', data.message);
                    // Re-add the link to the UI since server removal failed
                    gantt.addLink(link);
                }
            })
            .catch(error => {
                console.error('Error removing dependency:', error);
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

    
    // Expand all button
    var expandBtn = document.getElementById('dhtmlx-expand-all');
    if (expandBtn) {
        expandBtn.addEventListener('click', function() {
            gantt.eachTask(function(task) {
                task.$open = true;
            });
            gantt.render();
        });
    }
    
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